import eslintConfig from '@kalimahapps/eslint-config';
import kalimahAppsTailwind from '@kalimahapps/eslint-plugin-tailwind';
export default [
	...eslintConfig, {
		plugins: {
			kalimahAppsTailwind,
		},
		rules: {
		// This rule is causing an error:
		// `Cannot read properties of undefined (reading 'decoration')` error
		// Disable it until it's fixed
			'unicorn/expiring-todo-comments': 'off',
			'vue/no-child-conten': 'off',
			'kalimahAppsTailwind/sort': 'warn',
			'kalimahAppsTailwind/multiline': 'warn',
		},
	},
];