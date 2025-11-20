<script lang="ts">
	import { base } from "$app/paths";
	import { page } from "$app/state";

	import CarbonCheckmark from "~icons/carbon/checkmark";
	import CarbonTrashCan from "~icons/carbon/trash-can";
	import CarbonClose from "~icons/carbon/close";
	import CarbonEdit from "~icons/carbon/edit";
	import type { ConvSidebar } from "$lib/types/ConvSidebar";

	import EditConversationModal from "$lib/components/EditConversationModal.svelte";
	import { requireAuthUser } from "$lib/utils/auth";

	interface Props {
		conv: ConvSidebar;
		readOnly?: true;
		ondeleteConversation?: (id: string) => void;
		oneditConversationTitle?: (payload: { id: string; title: string }) => void;
	}

	let { conv, readOnly, ondeleteConversation, oneditConversationTitle }: Props = $props();

	let confirmDelete = $state(false);
	let renameOpen = $state(false);
</script>

<a
	data-sveltekit-noscroll
	onmouseleave={() => {
		confirmDelete = false;
	}}
	href="{base}/conversation/{conv.id}"
	class="group flex h-[2.15rem] flex-none items-center gap-1.5 rounded-lg pl-2.5 pr-2 text-gray-600 hover:bg-premium-red/10 hover:text-premium-red dark:text-gray-300 dark:hover:bg-premium-red-dark/20 dark:hover:text-premium-red-light max-sm:h-10 transition-all duration-200 hover:translate-x-1 hover:shadow-sm border border-transparent
		{conv.id === page.params.id ? 'bg-premium-red/10 dark:bg-premium-red-dark/20 border-premium-red/30 dark:border-premium-red-light/30 text-premium-red dark:text-premium-red-light shadow-sm font-medium' : ''}"
>
	<div class="my-2 min-w-0 flex-1 truncate first-letter:uppercase">
		<span>
			{#if confirmDelete}
				<span class="mr-1 font-semibold"> Delete? </span>
			{/if}
			{conv.title}
		</span>
	</div>

	{#if !readOnly}
		{#if confirmDelete}
			<button
				type="button"
				class="flex h-5 w-5 items-center justify-center rounded md:hidden md:group-hover:flex"
				title="Cancel delete action"
				onclick={(e) => {
					e.preventDefault();
					if (requireAuthUser()) return;
					confirmDelete = false;
				}}
			>
				<CarbonClose class="text-xs text-gray-400 hover:text-premium-red dark:hover:text-premium-red-light transition-colors duration-200" />
			</button>
			<button
				type="button"
				class="flex h-5 w-5 items-center justify-center rounded md:hidden md:group-hover:flex"
				title="Confirm delete action"
				onclick={(e) => {
					e.preventDefault();
					if (requireAuthUser()) return;
					confirmDelete = false;
					ondeleteConversation?.(conv.id.toString());
				}}
			>
				<CarbonCheckmark
					class="text-xs text-gray-400 hover:text-premium-red dark:hover:text-premium-red-light transition-colors duration-200"
				/>
			</button>
		{:else}
			<button
				type="button"
				class="flex h-5 w-5 items-center justify-center rounded md:hidden md:group-hover:flex"
				title="Edit conversation title"
				onclick={(e) => {
					e.preventDefault();
					if (requireAuthUser()) return;
					renameOpen = true;
				}}
			>
				<CarbonEdit class="text-xs text-gray-400 hover:text-premium-red dark:hover:text-premium-red-light transition-colors duration-200" />
			</button>

			<button
				type="button"
				class="flex h-5 w-5 items-center justify-center rounded md:hidden md:group-hover:flex"
				title="Delete conversation"
				onclick={(event) => {
					event.preventDefault();
					if (requireAuthUser()) return;
					if (event.shiftKey) {
						ondeleteConversation?.(conv.id.toString());
					} else {
						confirmDelete = true;
					}
				}}
			>
				<CarbonTrashCan
					class="text-xs text-gray-400 hover:text-premium-red dark:hover:text-premium-red-light transition-colors duration-200"
				/>
			</button>
		{/if}
	{/if}
</a>

<!-- Edit title modal -->
{#if renameOpen}
	<EditConversationModal
		open={renameOpen}
		title={conv.title}
		onclose={() => (renameOpen = false)}
		onsave={(payload) => {
			renameOpen = false;
			oneditConversationTitle?.({ id: conv.id.toString(), title: payload.title });
		}}
	/>
{/if}
