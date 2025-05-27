<template>
	<div
		class="bg-gradient-to-br
			from-blue-50
			to-blue-100
			min-h-screen
			pb-10
			px-0
			relative"
	>
		<!-- Hero Header -->
		<div
			ref="headerReference"
			class="bg-blue-100
				border-b
				border-blue-200
				duration-300
				mb-0
				px-2
				md:px-0
				shadow
				sticky
				top-0
				text-center
				transition-all
				w-full
				z-30"
			:class="isHeaderSticky
				? 'py-1 md:py-2 backdrop-blur-md bg-blue-100/95'
				: 'py-8 md:py-12'"
			style="will-change: padding, background;"
		>
			<h1
				class="duration-300
					font-extrabold
					mb-2
					text-blue-700
					tracking-tight
					transition-all"
				:class="isHeaderSticky ? 'text-xl md:text-2xl' : 'text-3xl md:text-4xl'"
			>
				Bilingual Medical Glossary
			</h1>
			<p
				class="duration-300
					max-w-2xl
					mx-auto
					text-blue-500
					transition-all"
				:class="isHeaderSticky ? 'text-xs md:text-sm mb-1' : 'text-base md:text-lg mb-4'"
			>
				Find English medical terms and their Arabic translations
			</p>
			<div
				class="flex
					md:flex-row
					md:justify-between
					md:items-center
					flex-col
					gap-4
					max-w-4xl
					mx-auto"
			>
				<GlossaryAutocomplete
					v-model="searchInput"
					:terms="terms"
					:terms-count="allTermsCount"
					placeholder="Search medical terms..."
					@select="onAutocompleteSelect"
				/>
			</div>
			<div class="flex justify-center flex-wrap gap-1 mt-4">
				<template v-for="letter in alphabet" :key="letter">
					<button
						v-if="byLetter[letter] && byLetter[letter].length > 0"
						type="button"
						class="cursor-pointer
							flex
							justify-center
							items-center
							font-semibold
							h-8
							rounded
							transition
							w-8"
						:class="[
							selectedLetter === letter
								? 'bg-blue-500 text-white shadow'
								: 'bg-blue-200 text-blue-700 hover:bg-blue-300'
						]"
						@click="filterByLetter(letter)"
					>
						{{ letter }}
					</button>
				</template>
				<button
					v-if="selectedLetter"
					type="button"
					class="bg-gray-200
						hover:bg-gray-300
						border
						border-gray-300
						cursor-pointer
						flex
						justify-center
						items-center
						h-8
						ml-2
						rounded-full
						text-gray-600
						transition
						w-8"
					@click="clearLetterFilter"
				>
					×
				</button>
			</div>
		</div>
		<!-- Loading indicator -->
		<div
			v-if="loading"
			class="absolute
				top-4
				right-4
				animate-pulse
				bg-white/80
				flex
				items-center
				gap-2
				px-4
				py-2
				rounded
				shadow
				text-blue-600
				text-sm
				z-50"
		>
			<svg
				class="animate-spin h-4 w-4"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				viewBox="0 0 24 24"
			>
				<circle
					cx="12"
					cy="12"
					r="10"
					stroke-opacity="0.2"
				/>
				<path d="M12 2a10 10 0 0 1 10 10" />
			</svg>
			Loading glossary...
		</div>
		<!-- Boxed List -->
		<div class="max-w-4xl mt-8 mx-auto relative w-full z-10">
			<div
				v-if="loading"
				class="animate-pulse py-16 text-blue-400 text-center"
			>
				Loading glossary...
			</div>
			<div v-else>
				<div>
					<template v-for="letter in alphabet" :key="letter">
						<GlossaryLetterGroup
							v-if="byLetter[letter] && byLetter[letter].length > 0"
							:letter="letter"
							:terms="visibleByLetter[letter]"
							:show-more-visible="byLetter[letter] && visibleByLetter[letter].length < byLetter[letter].length"
							@show-more="showMore"
						/>
					</template>
				</div>
				<div
					v-if="!filteredTerms.length"
					class="py-12 text-center text-gray-400 text-lg"
				>
					No terms found.
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import {
	ref,
	computed,
	onMounted,
	watch,
	reactive
} from 'vue';
import initSqlJs from 'sql.js';
import { useElementBounding, useWindowScroll } from '@vueuse/core';
import GlossaryLetterGroup from './GlossaryLetterGroup.vue';
import GlossaryAutocomplete from './GlossaryAutocomplete.vue';

// This is the actual filter
const search = ref('');

// This is the input for autocomplete
const searchInput = ref('');
const terms = ref([]);
const allTermsCount = ref(0);
const loading = ref(true);
const alphabet = Array.from({ length: 26 }, function (item, index) {
	return String.fromCodePoint(65 + index);
});
const selectedLetter = ref('');
const isHeaderSticky = ref(false);
const headerReference = ref();

// Use vueuse to update isHeaderSticky based on scroll position
const { y: scrollY } = useWindowScroll();
const { top: headerTop } = useElementBounding(headerReference);

watch([scrollY, headerTop], () => {
	// If at very top of page, remove sticky; otherwise, sticky if header is at or above viewport
	isHeaderSticky.value = scrollY.value > 0 && headerTop.value <= 0;
});

const filterByLetter = function (letter) {
	if (selectedLetter.value === letter) {
		selectedLetter.value = '';
		return;
	}

	selectedLetter.value = letter;
};

const clearLetterFilter = function () {
	selectedLetter.value = '';
};

const filteredTerms = computed(function () {
	let filteredList = terms.value;

	if (search.value) {
		const searchTerm = search.value.toLowerCase();
		filteredList = filteredList.filter(function (term) {
			return (
				term.english.toLowerCase().includes(searchTerm) ||
				term.arabic.includes(searchTerm)
			);
		});
	}
	if (selectedLetter.value) {
		filteredList = filteredList.filter(function (term) {
			return term.english[0].toUpperCase() === selectedLetter.value;
		});
	}
	return filteredList;
});

// Remove infinite scroll logic
// Add per-letter paging
const CARDS_PER_LETTER = 10;

const byLetter = computed(() => {
	const map = {};
	for (const letter of alphabet) {
		map[letter] = filteredTerms.value.filter(
			(term) => { return term.english[0] && term.english[0].toUpperCase() === letter; }
		);
	}
	return map;
});

const visibleByLetterState = reactive({});

const visibleByLetter = computed(() => {
	const map = {};
	for (const letter of alphabet) {
		const count = visibleByLetterState[letter] || CARDS_PER_LETTER;
		map[letter] = byLetter.value[letter]?.slice(0, count) || [];
	}
	return map;
});

const showMore = (letter) => {
	visibleByLetterState[letter] =
		(visibleByLetterState[letter] || CARDS_PER_LETTER) + CARDS_PER_LETTER;
};

watch([filteredTerms], () => {
	for (const letter of alphabet) {
		visibleByLetterState[letter] = CARDS_PER_LETTER;
	}
});

onMounted(async () => {
	const SQL = await initSqlJs({
		locateFile: (file) => {
			return `https://sql.js.org/dist/${file}`;
		},
	});

	// Load the database file from public folder
	const response = await fetch('/english-arabic-glossary/medical.db');
	const buffer = await response.arrayBuffer();
	const database = new SQL.Database(new Uint8Array(buffer));

	// Try to detect columns
	const queryResult = database.exec('SELECT id, english, arabic FROM glossary');
	if (queryResult[0]) {
		terms.value = queryResult[0].values.map(function (row) {
			const [id, english, arabic] = row;
			return {
				id,
				english,
				arabic,
			};
		});
	}

	const queryTermsCount = database.exec('SELECT COUNT(*) as count FROM glossary');
	if (queryTermsCount[0]) {
		allTermsCount.value = queryTermsCount[0].values[0][0];
	}
	loading.value = false;
});

const onAutocompleteSelect = function(term) {
	search.value = term;
};
</script>