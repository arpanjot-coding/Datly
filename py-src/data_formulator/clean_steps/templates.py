"""Deterministic pandas templates for Phase A clean verbs.

Every interpolated value is a Python literal from ``repr`` / ``json``.
Callers must never pass client-authored source code.
"""

from __future__ import annotations

import json
from typing import Any

CLEAN_VERBS = frozenset({
    "rename",
    "split",
    "replace",
    "trim",
    "fill",
    "drop",
    "dedupe",
    "cast",
    "first_row_header",
    "keep_rows",
    "remove_rows",
})

OUTPUT_VARS = {
    "rename": "df_rename",
    "split": "df_split",
    "replace": "df_replace",
    "trim": "df_trim",
    "fill": "df_fill",
    "drop": "df_drop",
    "dedupe": "df_dedupe",
    "cast": "df_cast",
    "first_row_header": "df_first_row_header",
    "keep_rows": "df_keep_rows",
    "remove_rows": "df_remove_rows",
}

CAST_TYPES = frozenset({
    "string",
    "boolean",
    "integer",
    "number",
    "date",
    "datetime",
    "time",
    "duration",
})

_MAX_ROW_KEYS = 2000


def compile_clean_step(verb: str, params: dict[str, Any], source_file: str) -> tuple[str, str]:
    """Return ``(code, output_variable)`` for a named verb."""
    if not isinstance(verb, str) or verb not in CLEAN_VERBS:
        raise ValueError("unknown clean verb")
    if not isinstance(params, dict):
        raise ValueError("params must be an object")
    source = _require_str(source_file, "source_file")
    return _COMPILERS[verb](params, source)


def _require_str(value: Any, name: str, *, allow_empty: bool = False) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{name} must be a string")
    if not allow_empty and value == "":
        raise ValueError(f"{name} is required")
    if "\x00" in value:
        raise ValueError(f"{name} is invalid")
    return value


def _require_column(params: dict[str, Any]) -> str:
    return _require_str(params.get("column"), "column")


def _lit(value: Any) -> str:
    return repr(value)


def _header(verb: str) -> str:
    return f"# clean_step: {verb}"


def _load(source_file: str) -> str:
    return f"_source = pd.read_parquet({_lit(source_file)})"


def _framed(verb: str, source_file: str, body_lines: list[str]) -> str:
    lines = [
        _header(verb),
        "import pandas as pd",
        _load(source_file),
        *body_lines,
        "",
    ]
    return "\n".join(lines)


def _rename(params: dict[str, Any], source_file: str) -> tuple[str, str]:
    column = _require_column(params)
    new_name = _require_str(params.get("new_name"), "new_name")
    out = OUTPUT_VARS["rename"]
    code = _framed("rename", source_file, [
        f"{out} = _source.rename(columns={{{_lit(column)}: {_lit(new_name)}}})",
    ])
    return code, out


def _split(params: dict[str, Any], source_file: str) -> tuple[str, str]:
    column = _require_column(params)
    delimiter = _require_str(params.get("delimiter"), "delimiter")
    parts = params.get("parts", 2)
    if not isinstance(parts, int) or isinstance(parts, bool) or parts < 2 or parts > 16:
        raise ValueError("parts must be an integer from 2 to 16")
    out = OUTPUT_VARS["split"]
    code = _framed("split", source_file, [
        f"{out} = _source.copy()",
        f"_parts = {out}[{_lit(column)}].astype(str).str.split({_lit(delimiter)}, n={parts - 1}, expand=True)",
        f"for _i in range(_parts.shape[1]):",
        f"    _name = {_lit(column)} + '_' + str(_i + 1)",
        f"    {out}[_name] = _parts[_i]",
    ])
    return code, out


def _replace(params: dict[str, Any], source_file: str) -> tuple[str, str]:
    column = _require_column(params)
    find = _require_str(params.get("find"), "find")
    repl = _require_str(params.get("replace"), "replace", allow_empty=True)
    out = OUTPUT_VARS["replace"]
    code = _framed("replace", source_file, [
        f"{out} = _source.copy()",
        f"{out}[{_lit(column)}] = {out}[{_lit(column)}].astype(str).str.replace({_lit(find)}, {_lit(repl)}, regex=False)",
    ])
    return code, out


def _trim(params: dict[str, Any], source_file: str) -> tuple[str, str]:
    column = _require_column(params)
    out = OUTPUT_VARS["trim"]
    code = _framed("trim", source_file, [
        f"{out} = _source.copy()",
        f"_trimmed = {out}[{_lit(column)}].astype(str).str.strip()",
        f"{out}[{_lit(column)}] = _trimmed.mask(_trimmed == '', pd.NA)",
    ])
    return code, out


def _fill(params: dict[str, Any], source_file: str) -> tuple[str, str]:
    column = _require_column(params)
    if "value" not in params:
        raise ValueError("value is required")
    value = params.get("value")
    if value is not None and not isinstance(value, (str, int, float, bool)):
        raise ValueError("value must be a scalar")
    out = OUTPUT_VARS["fill"]
    code = _framed("fill", source_file, [
        f"{out} = _source.copy()",
        f"{out}[{_lit(column)}] = {out}[{_lit(column)}].fillna({_lit(value)})",
    ])
    return code, out


def _drop(params: dict[str, Any], source_file: str) -> tuple[str, str]:
    column = _require_column(params)
    out = OUTPUT_VARS["drop"]
    code = _framed("drop", source_file, [
        f"{out} = _source.drop(columns=[{_lit(column)}])",
    ])
    return code, out


def _dedupe(params: dict[str, Any], source_file: str) -> tuple[str, str]:
    column = params.get("column")
    out = OUTPUT_VARS["dedupe"]
    if column is None or column == "":
        body = [f"{out} = _source.drop_duplicates(keep='first').reset_index(drop=True)"]
    else:
        col = _require_str(column, "column")
        body = [f"{out} = _source.drop_duplicates(subset=[{_lit(col)}], keep='first').reset_index(drop=True)"]
    return _framed("dedupe", source_file, body), out


def _cast(params: dict[str, Any], source_file: str) -> tuple[str, str]:
    column = _require_column(params)
    target = _require_str(params.get("type"), "type")
    if target not in CAST_TYPES:
        raise ValueError("unsupported cast type")
    out = OUTPUT_VARS["cast"]
    failed = f"{column}__cast_failed"
    code = _framed("cast", source_file, [
        "import numpy as np",
        f"{out} = _source.copy()",
        f"_raw = {out}[{_lit(column)}]",
        f"_target = {_lit(target)}",
        f"_blank = _raw.isna() | (_raw.astype(str).str.strip() == '')",
        "if _target == 'string':",
        "    _casted = _raw.map(lambda v: None if v is None or (isinstance(v, float) and pd.isna(v)) else str(v))",
        "    _failed = pd.Series(False, index=_raw.index)",
        "elif _target == 'boolean':",
        "    _map = {'true': True, 'false': False, '1': True, '0': False, 'yes': True, 'no': False, 't': True, 'f': False}",
        "    _norm = _raw.map(lambda v: None if v is None or (isinstance(v, float) and pd.isna(v)) else str(v).strip().lower())",
        "    _casted = _norm.map(lambda v: v if isinstance(v, bool) else _map.get(v, np.nan))",
        "    _direct = _raw.map(lambda v: v if isinstance(v, bool) else np.nan)",
        "    _casted = _direct.where(_direct.notna(), _casted)",
        "    _failed = ~_blank & _casted.isna()",
        "elif _target == 'integer':",
        "    _num = pd.to_numeric(_raw, errors='coerce')",
        "    _casted = _num.round().astype('Int64')",
        "    _failed = ~_blank & _casted.isna()",
        "elif _target == 'number':",
        "    _casted = pd.to_numeric(_raw, errors='coerce')",
        "    _failed = ~_blank & _casted.isna()",
        "elif _target in ('date', 'datetime'):",
        "    _casted = pd.to_datetime(_raw, errors='coerce')",
        "    if _target == 'date':",
        "        _casted = _casted.dt.strftime('%Y-%m-%d')",
        "    _failed = ~_blank & _casted.isna()",
        "elif _target == 'time':",
        "    _as_dt = pd.to_datetime(_raw, errors='coerce')",
        "    _casted = _as_dt.dt.strftime('%H:%M:%S')",
        "    _failed = ~_blank & _casted.isna()",
        "else:",
        "    _casted = _raw.astype(str)",
        "    _failed = pd.Series(False, index=_raw.index)",
        f"{out}[{_lit(column)}] = _casted",
        f"{out}[{_lit(failed)}] = _failed.fillna(False).astype(bool)",
        f"if not {out}[{_lit(failed)}].any():",
        f"    {out} = {out}.drop(columns=[{_lit(failed)}])",
    ])
    return code, out


def _first_row_header(params: dict[str, Any], source_file: str) -> tuple[str, str]:
    out = OUTPUT_VARS["first_row_header"]
    code = _framed("first_row_header", source_file, [
        "if len(_source) == 0:",
        f"    {out} = _source.copy()",
        "else:",
        "    _names = []",
        "    _used = set()",
        "    for _i, _val in enumerate(_source.iloc[0].tolist()):",
        "        _base = str(_val).strip() if _val is not None and str(_val).strip() != '' else f'c{_i}'",
        "        _name = _base",
        "        _k = 1",
        "        while _name in _used:",
        "            _name = f'{_base}_{_k}'",
        "            _k += 1",
        "        _used.add(_name)",
        "        _names.append(_name)",
        f"    {out} = _source.iloc[1:].copy()",
        f"    {out}.columns = _names",
        f"    {out} = {out}.reset_index(drop=True)",
    ])
    return code, out


def _row_filter(params: dict[str, Any], source_file: str, *, keep: bool) -> tuple[str, str]:
    verb = "keep_rows" if keep else "remove_rows"
    rows = params.get("rows")
    if not isinstance(rows, list) or len(rows) == 0:
        raise ValueError("rows must be a non-empty list")
    if len(rows) > _MAX_ROW_KEYS:
        raise ValueError("too many rows")
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError("each row must be an object")
    payload = json.dumps(rows, ensure_ascii=True, separators=(",", ":"), default=str)
    out = OUTPUT_VARS[verb]
    how = "both" if keep else "left_only"
    code = _framed(verb, source_file, [
        "import json",
        f"_keys = pd.DataFrame(json.loads({_lit(payload)}))",
        "_cols = [c for c in _keys.columns if c in _source.columns]",
        "if not _cols:",
        f"    {out} = _source.copy() if {str(not keep)} else _source.iloc[0:0].copy()",
        "else:",
        "    _flag = _source.merge(_keys[_cols].drop_duplicates(), on=_cols, how='left', indicator=True)",
        f"    {out} = _flag[_flag['_merge'] == {_lit(how)}].drop(columns=['_merge']).reset_index(drop=True)",
    ])
    return code, out


def _keep_rows(params: dict[str, Any], source_file: str) -> tuple[str, str]:
    return _row_filter(params, source_file, keep=True)


def _remove_rows(params: dict[str, Any], source_file: str) -> tuple[str, str]:
    return _row_filter(params, source_file, keep=False)


_COMPILERS = {
    "rename": _rename,
    "split": _split,
    "replace": _replace,
    "trim": _trim,
    "fill": _fill,
    "drop": _drop,
    "dedupe": _dedupe,
    "cast": _cast,
    "first_row_header": _first_row_header,
    "keep_rows": _keep_rows,
    "remove_rows": _remove_rows,
}
