<script lang="ts">
  import Button from '$lib/client/components/Button.svelte';
  import Input from '$lib/client/components/Input.svelte';
  import { toastStore } from '$lib/common/store/toast';
  import type { User } from '$lib/feature/users/UserModel.js';
  import { onMount } from 'svelte';
  import type { ActionData } from './$types';
  import getItOnPlaystore from '$lib/client/assets/get_it_on_playstore.png';

  interface Props {
    data: {
      user: User;
      currentStep: number;
      qrCodeUrl: string;
      secret: string;
    };
    form: ActionData;
  }

  let { data, form }: Props = $props();
  const user = $derived(data.user);

  onMount(() => {
    if (form?.message) toastStore.show(form.message, 'red');
  });
</script>

<section class="relative flex min-h-dvh flex-col items-center overflow-hidden p-5 pt-10">
  {#if data.currentStep === 1}
    <form
      action="?/changePassword"
      method="POST"
      class="w-full max-w-sm rounded border-2 bg-black p-5"
    >
      <div class="mb-3 text-center text-2xl">Step 1/3 - Reset Password</div>
      <div class="mb-3 text-center text-xl">User: {user.username}</div>
      <Input
        name="newPassword"
        label="New Password"
        labelBg="bg-black"
        autofocus={true}
        acceptCustomValue={true}
      />
      <Input
        name="confirmPassword"
        label="Confirm Password"
        labelBg="bg-black"
        acceptCustomValue={true}
      />
      <div class="flex justify-end gap-3">
        <Button type="submit">Reset</Button>
        <Button color="gray">Cancel</Button>
      </div>
    </form>
  {:else if data.currentStep === 2}
    <form
      action="?/configureTOTP"
      method="POST"
      class="w-full max-w-sm rounded border-2 bg-black p-5"
    >
      <div class="mb-3 text-center text-2xl">Step 2/3 - Configure TOTP</div>
      <div class="text-center">
        1. Install <span class="inline-block font-bold text-green-500">Google Authenticater</span> App
      </div>
      <a
        target="_blank"
        href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
        class="flex items-center justify-center"
      >
        <div>
          <img alt="Get it on Google Play" src={getItOnPlaystore} width="200px" />
        </div>
      </a>
      <div class="text-center">2. Scan QR Code in that App</div>
      <div class="my-3 text-center">
        <img class="w-full" src={data.qrCodeUrl} alt="" />
        or
        <div>
          <span>Enter the Key manually </span>
          <span class="block rounded bg-white p-1 wrap-anywhere text-black">{data.secret}</span>
          <input type="hidden" name="secret" value={data.secret} />
        </div>
      </div>
      <div class="flex justify-end gap-3">
        <Button type="submit">Success</Button>
        <Button color="gray">Cancel</Button>
      </div>
    </form>
  {:else if data.currentStep === 3}
    <form action="?/verifyTOTP" method="POST" class="w-full max-w-sm rounded border-2 bg-black p-5">
      <div class="mb-3 text-center text-2xl">Step 3/3 - Verify TOTP</div>
      <Input
        name="totp"
        label="Enter 6 digit code"
        labelBg="bg-black"
        type="number"
        autofocus={true}
        acceptCustomValue={true}
      />
      <div class="flex justify-end gap-3">
        <Button type="submit">Verify</Button>
        <Button color="gray">Cancel</Button>
      </div>
    </form>
  {/if}
</section>
