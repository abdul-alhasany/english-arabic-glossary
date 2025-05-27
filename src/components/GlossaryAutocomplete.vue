<template>
	<div class="w-full">
		<div ref="inputContainer" class="relative">
			<div
				class="bg-white
					border
					border-blue-200
					flex
					items-center
					relative
					rounded-md"
			>
				<span
					class="flex
						justify-center
						items-center
						pointer-events-none
						text-blue-400
						w-12"
				>
					<BsSearch />
				</span>
				<input
					v-model="inputValue"
					type="text"
					:placeholder="getPlaceHolder"
					autocomplete="off"
					class="bg-transparent
						outline-none
						placeholder-gray-400
						py-2
						text-gray-700
						w-full"
					@input="onInput"
					@focus="showDropdown = true"
					@keydown.down.prevent="moveSelection(1)"
					@keydown.up.prevent="moveSelection(-1)"
					@keydown.enter.prevent="selectSuggestion(selectedIndex)"
				>
				<span
					v-if="inputValue"
					class="cursor-pointer
						flex
						justify-center
						items-center
						text-blue-400
						w-12"
					@click="inputValue = ''"
				>
					<AkXSmall />
				</span>
			</div>
			<ul
				v-if="showDropdown && suggestions.length > 0"
				class="absolute
					right-0
					left-0
					bg-white
					border
					border-blue-200
					max-h-60
					mt-1
					overflow-auto
					rounded
					shadow
					z-50"
			>
				<li
					v-for="(suggestion, index) in suggestions"
					:key="suggestion.id"
					class="cursor-pointer px-4 py-2 hover:bg-blue-50"
					:class="index === selectedIndex ? 'bg-blue-100 text-blue-700' : ''"
					@mousedown.prevent="selectSuggestion(index)"
					@mouseenter="selectedIndex = index"
				>
					<span class="font-semibold text-blue-900">{{ suggestion.english }}</span>
					<span class="ml-2 text-blue-700 text-sm">{{ suggestion.arabic }}</span>
				</li>
			</ul>
		</div>
		<div
			v-if="searchHistory.length"
			class="bg-blue-50
				border
				border-blue-200
				flex-wrap
				md:flex
				items-center
				gap-2
				hidden
				mt-2
				px-3
				py-2
				rounded-lg"
		>
			<span class="mr-2 text-gray-400 text-xs">Recent:</span>
			<button
				v-for="(item, idx) in searchHistory"
				:key="item + idx"
				type="button"
				class="bg-white
					border
					border-blue-100
					cursor-pointer
					px-2
					py-0.5
					rounded
					text-blue-600
					text-sm
					hover:underline"
				@click="selectHistory(item)"
			>
				{{ item }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { BsSearch } from '@kalimahapps/vue-icons';
import { AkXSmall } from '@kalimahapps/vue-icons';
import { onClickOutside } from '@vueuse/core';

/**
 * @property {string} modelValue  - The v-model value for the input.
 * @property {Array}  terms       - The list of all glossary terms.
 * @property {string} placeholder - The input placeholder text.
 */
const {termsCount,terms,modelValue} = defineProps({
	/** v-model value */
	modelValue: {
		type: String,
		default: '',
	},

	/** List of all terms */
	terms: {
		type: Array,
		default: () => {
			return [];
		},
	},

	/**
	 * Count of all terms.
	 */
	termsCount: {
		type: Number,
		default: 0,
	},
});
const emit = defineEmits(['update:modelValue', 'select']);

const inputValue = ref(modelValue || '');
const showDropdown = ref(false);
const selectedIndex = ref(-1);
const searchHistory = ref([]);
const inputContainer = ref();

const SEARCH_HISTORY_KEY = 'medical-glossary-search-history';

// Load persisted search history on mount
const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
if (saved) {
	const historyArray = JSON.parse(saved);
	if (Array.isArray(historyArray)) {
		searchHistory.value = historyArray;
	}
}

const saveHistory = () => {
	localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value));
};

const getPlaceHolder = computed(() => {
	if (termsCount > 0) {
		return `Search ${termsCount} terms...`;
	}
	return 'Search terms...';
});

watch(() => {
	return modelValue;
}, (value) => {
	inputValue.value = value;
});

const suggestions = computed(() => {
	if (!inputValue.value) {
		return [];
	}
	const search = inputValue.value.toLowerCase();
	return terms.filter((term) => {
		return term.english.toLowerCase().includes(search) ||
			(term.arabic && term.arabic.includes(search));
	}).slice(0, 10);
});

const onInput = () => {
	emit('update:modelValue', inputValue.value);
	showDropdown.value = true;
	selectedIndex.value = -1;
};

const addToHistory = (value) => {
	if (!value) {
		return;
	}

	// Don't do anything if the value is already in history
	if (searchHistory.value.includes(value)) {
		return;
	}

	// Add to front
	searchHistory.value.unshift(value);

	// Keep only last 5
	if (searchHistory.value.length > 5) {
		searchHistory.value = searchHistory.value.slice(0, 5);
	}

	saveHistory();
};

const selectSuggestion = (index) => {
	const suggestion = suggestions.value[index];
	if (suggestion) {
		inputValue.value = suggestion.english;
		emit('update:modelValue', suggestion.english);
		emit('select', suggestion.english);
		showDropdown.value = false;
		addToHistory(suggestion.english);
	}
};

const selectHistory = (item) => {
	inputValue.value = item;
	emit('update:modelValue', item);
	emit('select', item);
	showDropdown.value = false;
	addToHistory(item);
};

const moveSelection = (direction) => {
	if (!showDropdown.value || suggestions.value.length === 0) {
		return;
	}
	let next = selectedIndex.value + direction;
	if (next < 0) {
		next = suggestions.value.length - 1;
	}
	if (next >= suggestions.value.length) {
		next = 0;
	}
	selectedIndex.value = next;
};

onClickOutside(inputContainer, () => {
	showDropdown.value = false;
});

// watch input and emit value when empty
watch(inputValue, (value) => {
	if (!value) {
		emit('update:modelValue', '');
		emit('select', '');
		showDropdown.value = false;
		selectedIndex.value = -1;
	}
});
</script>
