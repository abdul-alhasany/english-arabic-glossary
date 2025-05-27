<template>
	<div class="flex items-center gap-2">
		<span class="font-bold text-blue-900 md:text-xl text-lg truncate">
			{{ english }}
		</span>
		<!-- Arabic tags -->
		<template v-for="(arabicWord, idx) in extractArabicList(arabic)" :key="idx">
			<span
				class="bg-blue-50
					font-semibold
					ml-1
					px-2
					py-0.5
					rounded
					text-base
					md:text-lg
					text-blue-700"
			>
				{{ arabicWord }}
			</span>
		</template>
	</div>
</template>

<script setup>
defineProps({
	/**
	 * The English term.
	 *
	 * @type {String}
	 */
	english: {
		type: String,
		default: '',
	},

	/**
	 * The Arabic term.
	 *
	 * @type {String}
	 */
	arabic: {
		type: String,
		default: '',
	},
});

const extractArabicList = (arabic) => {
	if (!arabic) {
		return [];
	}

	return arabic.split(',');
};
</script>
