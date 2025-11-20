<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { cubicOut } from "svelte/easing";
	import { fade, fly } from "svelte/transition";
	import Portal from "./Portal.svelte";
	import { browser } from "$app/environment";
	import CarbonClose from "~icons/carbon/close";

	interface Props {
		width?: string;
		closeButton?: boolean;
		disableFly?: boolean;
		/** When false, clicking backdrop will not close the modal */
		closeOnBackdrop?: boolean;
		onclose?: () => void;
		children?: import("svelte").Snippet;
	}

	let {
		width = "max-w-sm",
		children,
		closeButton = false,
		disableFly = false,
		closeOnBackdrop = true,
		onclose,
	}: Props = $props();

	let backdropEl: HTMLDivElement | undefined = $state();
	let modalEl: HTMLDivElement | undefined = $state();

	function handleKeydown(event: KeyboardEvent) {
		// close on ESC
		if (event.key === "Escape") {
			event.preventDefault();
			onclose?.();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (window?.getSelection()?.toString()) {
			return;
		}
		if (event.target === backdropEl && closeOnBackdrop) {
			onclose?.();
		}
	}

	onMount(() => {
		document.getElementById("app")?.setAttribute("inert", "true");
		modalEl?.focus();
		// Ensure Escape closes even if focus isn't within modal
		window.addEventListener("keydown", handleKeydown, { capture: true });
	});

	onDestroy(() => {
		if (!browser) return;
		document.getElementById("app")?.removeAttribute("inert");
		window.removeEventListener("keydown", handleKeydown, { capture: true });
	});
</script>

<Portal>
	<div
		role="presentation"
		tabindex="-1"
		bind:this={backdropEl}
		onclick={(e) => {
			e.stopPropagation();
			handleBackdropClick(e);
		}}
		transition:fade|local={{ easing: cubicOut, duration: 300 }}
		class="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md dark:bg-black/70"
	>
		{#if disableFly}
			<div
				role="dialog"
				tabindex="-1"
				bind:this={modalEl}
				onkeydown={handleKeydown}
				class={[
					"scrollbar-custom relative mx-auto max-h-[95dvh] max-w-[90dvw] overflow-y-auto overflow-x-hidden rounded-2xl bg-white shadow-premium-lg outline-none border-2 border-gray-200 dark:border-premium-red/30 dark:bg-premium-dark-grey dark:text-gray-100",
					width,
				]}
			>
				{#if closeButton}
					<button class="absolute right-4 top-4 z-50 hover:bg-premium-red/10 rounded-full p-1 hover:scale-110 active:scale-95 transition-all duration-200 dark:hover:bg-premium-red-dark/20" onclick={() => onclose?.()}>
						<CarbonClose class="size-6 text-gray-700 hover:text-premium-red dark:text-gray-300 dark:hover:text-premium-red-light transition-colors duration-200" />
					</button>
				{/if}
				{@render children?.()}
			</div>
		{:else}
			<div
				role="dialog"
				tabindex="-1"
				bind:this={modalEl}
				onkeydown={handleKeydown}
				in:fly={{ y: 100 }}
				class={[
					"scrollbar-custom relative mx-auto max-h-[95dvh] max-w-[90dvw] overflow-y-auto overflow-x-hidden rounded-2xl bg-white shadow-premium-lg outline-none border-2 border-gray-200 dark:border-premium-red/30 dark:bg-premium-dark-grey dark:text-gray-100 animate-slide-up",
					width,
				]}
			>
				{#if closeButton}
					<button class="absolute right-4 top-4 z-50 hover:bg-premium-red/10 rounded-full p-1 hover:scale-110 active:scale-95 transition-all duration-200 dark:hover:bg-premium-red-dark/20" onclick={() => onclose?.()}>
						<CarbonClose class="size-6 text-gray-700 hover:text-premium-red dark:text-gray-300 dark:hover:text-premium-red-light transition-colors duration-200" />
					</button>
				{/if}
				{@render children?.()}
			</div>
		{/if}
	</div>
</Portal>
