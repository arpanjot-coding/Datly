import common from './common.json';
import upload from './upload.json';
import chart from './chart.json';
import model from './model.json';
import encoding from './encoding.json';
import messages from './messages.json';
import navigation from './navigation.json';
import dataLoading from './dataLoading.json';
import loader from './loader.json';
import errors from './errors.json';
import pipeline from '../en/pipeline.json';

export default {
  ...common,
  ...upload,
  ...chart,
  ...model,
  ...encoding,
  ...messages,
  ...navigation,
  ...dataLoading,
  ...loader,
  ...errors,
  pipeline,
};
