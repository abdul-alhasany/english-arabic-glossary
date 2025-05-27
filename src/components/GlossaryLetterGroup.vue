<template>
	<div class="mb-8 flex gap-4 flex-col md:flex-row px-6 md:px-0">
		<div
			class="md:sticky top-[200px] self-start z-20 flex-shrink-0"
			style="min-width: 3.5rem;"
		>
			<div
				class="text-blue-200 font-bold text-6xl md:text-7xl text-center select-none w-24"
			>
				{{ letter }}
			</div>
		</div>
		<div class="flex-1">
			<div class="grid grid-cols-1 gap-4">
				<GlossaryCard
					v-for="term in terms"
					:key="term.id"
					:term="term"
				/>
			</div>
			<div v-if="showMoreVisible" class="text-center mt-2">
				<button
					type="button"
					class="px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold \
					border border-blue-200 hover:bg-blue-200 transition"
					@click="$emit('show-more', letter)"
				>
					Show more
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import GlossaryCard from './GlossaryCard.vue';

defineProps({
	/**
	 * The letter for this group.
	 *
	 * @type {string}
	 */

	letter: {
		type: String,
		default: '',
	},

	/**
	 * The terms for this letter.
	 *
	 * @type {Array}
	 */

	terms: {
		type: Array,
		default: () => { return []; },
	},

	/**
	 * Whether to show the 'Show more' button.
	 *
	 * @type {boolean}
	 */

	showMoreVisible: {
		type: Boolean,
		default: false,
	},
});
</script>
