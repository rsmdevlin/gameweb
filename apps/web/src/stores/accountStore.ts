import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Account {
  id: string;
  token: string;
  username: string;
  displayName: string;
  avatar: string | null;
  lastActive: string;
}

interface AccountStore {
  accounts: Account[];
  currentAccountId: string | null;

  // Actions
  addAccount: (account: Account) => void;
  removeAccount: (accountId: string) => void;
  switchAccount: (accountId: string) => void;
  getCurrentAccount: () => Account | null;
  canAddAccount: (isPremium: boolean) => boolean;
  pruneExtraAccounts: (isPremium: boolean) => void;
  updateCurrentAccount: (data: Partial<Account>) => void;
}

export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      accounts: [],
      currentAccountId: null,

      addAccount: (account) => {
        set((state) => {
          // Проверяем лимит
          const isPremium = false; // TODO: получать из user данных
          const limit = isPremium ? 6 : 3;

          if (state.accounts.length >= limit) {
            alert(`Достигнут лимит аккаунтов: ${limit}. ${!isPremium ? 'Купите Basa Premium для 6 аккаунтов!' : ''}`);
            return state;
          }

          return {
            accounts: [...state.accounts, account],
            currentAccountId: account.id,
          };
        });
      },

      removeAccount: (accountId) => {
        set((state) => {
          const newAccounts = state.accounts.filter((a) => a.id !== accountId);
          const newCurrentId =
            state.currentAccountId === accountId && newAccounts.length > 0
              ? newAccounts[0].id
              : state.currentAccountId;

          return {
            accounts: newAccounts,
            currentAccountId: newCurrentId,
          };
        });
      },

      switchAccount: (accountId) => {
        set({ currentAccountId: accountId });
        // Reload page to reinitialize with new token
        window.location.reload();
      },

      getCurrentAccount: () => {
        const state = get();
        return state.accounts.find((a) => a.id === state.currentAccountId) || null;
      },

      canAddAccount: (isPremium) => {
        const state = get();
        const limit = isPremium ? 6 : 3;
        return state.accounts.length < limit;
      },

      pruneExtraAccounts: (isPremium) => {
        const limit = isPremium ? 6 : 3;
        set((state) => {
          if (state.accounts.length <= limit) return state;

          // Удаляем последние добавленные аккаунты (сверх лимита)
          const sortedAccounts = [...state.accounts].sort(
            (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
          );
          const accountsToKeep = sortedAccounts.slice(0, limit);

          return {
            accounts: accountsToKeep,
            currentAccountId: accountsToKeep.some((a) => a.id === state.currentAccountId)
              ? state.currentAccountId
              : accountsToKeep[0]?.id || null,
          };
        });
      },

      updateCurrentAccount: (data) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === state.currentAccountId ? { ...a, ...data } : a
          ),
        }));
      },
    }),
    {
      name: 'basa-accounts',
    }
  )
);
