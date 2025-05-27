<template>
	<div
		class="bg-white \
			border border-blue-100 \
			flex flex-col gap-2 \
			p-5 \
			rounded-xl \
			shadow hover:shadow-lg \
			transition"
	>
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-2 flex-wrap">
				<GlossaryTermHeader
					:english="term.english"
					:arabic="term.arabic"
				/>

			</div>
			<div class="flex items-center gap-1">
				<!-- TTS button -->
				<button
					type="button"
					class="text-blue-400 hover:text-blue-700 focus:outline-none cursor-pointer"
					:title="`Speak: ${term.english}`"
					@click="speakEnglish"
				>
					<FlFilledSpeaker2/>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import GlossaryTermHeader from './GlossaryTermHeader.vue';
import { FlFilledSpeaker2 } from '@kalimahapps/vue-icons';

const {term} = defineProps({
	/**
	 * The glossary term object.
	 *
	 * @type {Object}
	 */
	term: {
		type: Object,
		default: () => { return {}; },
	},
});

function speakEnglish() {
	if (typeof window !== 'undefined' && window.speechSynthesis) {
		const utter = new window.SpeechSynthesisUtterance(
			term && term.english ? term.english : ''
		);
		utter.lang = 'en-US';
		window.speechSynthesis.speak(utter);
	}
}
</script>
