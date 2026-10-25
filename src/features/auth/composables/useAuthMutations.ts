import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { ROUTE_NAMES } from '@/app/router/guards';
import type {
  ActivateAccountBody,
  ChangePasswordBody,
  ForgotPasswordBody,
  LoginBody,
  ResetPasswordBody,
} from '@/services/http';
import {
  activateAccount,
  changePassword,
  forgotPassword,
  login,
  logout,
  logoutAll,
  resetPassword,
} from '@/services/http/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export function useLoginMutation() {
  const auth = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginBody) => login(body),
    onSuccess: (response) => {
      queryClient.clear();
      auth.setSession(response);
    },
  });
}

/** Ends the local session even when the API call fails (expired session, offline). */
function useEndSession() {
  const auth = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return async () => {
    auth.clearSession();
    queryClient.clear();
    await router.replace({ name: ROUTE_NAMES.login });
  };
}

export function useLogoutMutation() {
  const endSession = useEndSession();
  return useMutation({ mutationFn: () => logout(), onSettled: endSession });
}

export function useLogoutAllMutation() {
  const endSession = useEndSession();
  return useMutation({ mutationFn: () => logoutAll(), onSettled: endSession });
}

export function useChangePasswordMutation() {
  const auth = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ChangePasswordBody) => changePassword(body),
    onSuccess: (response) => {
      auth.setSession(response);
      void queryClient.invalidateQueries();
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: (body: ForgotPasswordBody) => forgotPassword(body) });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: (body: ResetPasswordBody) => resetPassword(body) });
}

export function useActivateAccountMutation() {
  return useMutation({ mutationFn: (body: ActivateAccountBody) => activateAccount(body) });
}
