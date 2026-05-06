<script lang="ts">
  import Button from '$lib/client/components/Button.svelte';
  import Input from '$lib/client/components/Input.svelte';

  const { data } = $props();
</script>

<section class="relative flex min-h-dvh flex-col items-center overflow-hidden p-5 pt-10">
  {#if data.currentStep === 1}
    <form action="" class="w-full max-w-sm rounded border-2 bg-black p-5">
      <div class="mb-3 text-center text-2xl">Step 1/3 - Reset Password</div>
      <Input name="newPassword" label="New Password" labelBg="bg-black" />
      <Input name="confirmPassword" label="Confirm Password" labelBg="bg-black" />
      <div class="flex justify-end gap-3">
        <Button>Reset</Button>
        <Button color="gray">Cancel</Button>
      </div>
    </form>
  {:else if data.currentStep === 2}
    <form action="" class="w-full max-w-sm rounded border-2 bg-black p-5">
      <div class="mb-3 text-center text-2xl">Step 2/3 - Configure TOTP</div>
      <div class="text-center">1. Install Google Authenticater App</div>
      <a
        target="_blank"
        href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
        class="flex items-center justify-center"
      >
        <div class="overflow-hidden rounded">
          <img
            src="https://play-lh.googleusercontent.com/NntMALIH4odanPPYSqUOXsX8zy_giiK2olJiqkcxwFIOOspVrhMi9Miv6LYdRnKIg-3R=w240-h480-rw"
            alt=""
            width="50px"
            height="50px"
          />
        </div>
        <div>
          <img
            alt="Get it on Google Play"
            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
            width="200px"
          />
        </div>
      </a>
      <div class="text-center">2. Scan QR Code in that App</div>
      <div class="my-3 text-center">
        <img class="w-full" src={data.qrCodeUrl} alt="" />
      </div>
      <div class="flex justify-end gap-3">
        <Button>Success</Button>
        <Button color="gray">Cancel</Button>
      </div>
    </form>
  {:else if data.currentStep === 3}
    <form action="" class="w-full max-w-sm rounded border-2 bg-black p-5">
      <div class="mb-3 text-center text-2xl">Step 3/3 - Verify TOTP</div>
      <Input name="totp" label="Enter 6 digit code" labelBg="bg-black" type="number" />
      <div class="flex justify-end gap-3">
        <Button>Verify</Button>
        <Button color="gray">Cancel</Button>
      </div>
    </form>
  {/if}
</section>
