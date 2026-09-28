import { configureStore } from '@reduxjs/toolkit'
import { dataFormulatorReducer } from './dfSlice';

import { persistReducer, persistStore, createTransform } from 'redux-persist'
import localforage from 'localforage';
import { DF_STATE_VERSION, migrateState } from './stateMigrations';
import { stripConnectorPrefillFromEntries } from './connectorFormPersistence';

export type AppDispatch = typeof store.dispatch

// Never persist connector-form prefill values to storage. The agent may seed a
// live connection form with values the user provided in chat (a host, database,
// and, if they chose to share them, credentials) purely as a re-typing
// convenience. Those must NEVER be written to disk. In-memory Redux keeps
// `prefilled` so the form can seed once on render; this transform drops it on the
// way to localForage, so nothing is stored until the user clicks Connect.
const stripConnectorPrefill = createTransform(
    stripConnectorPrefillFromEntries,
    (outboundState: any) => outboundState,
    { whitelist: ['dataLoadingChatMessages', 'textTurns'] },
);

const persistConfig = {
    key: 'root',
    //storage,
    storage: localforage,
    version: DF_STATE_VERSION,
    // globalModels are always fetched fresh from the server on each app start,
    // so there is no need (and it would cause stale-data issues) to persist them.
    // In-progress flags are transient and should not survive page refreshes.
    // Thumbnails are derived from chart specs; do not persist them.
    blacklist: ['serverConfig', 'globalModels', 'chartSynthesisInProgress', 'starterQuestionsStatus', 'chartThumbnails'],
    transforms: [stripConnectorPrefill],
    migrate: async (state: any): Promise<any> => migrateState(state),
}

const persistedReducer = persistReducer(persistConfig, dataFormulatorReducer)

let store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
    }),
})

export const persistor = persistStore(store);

export default store;

// Export store instance for use in utilities
export { store };
