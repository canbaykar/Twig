import { InputRule, inputRules } from "prosemirror-inputrules";

const rules: [string, RegExp][] = [
	// Logic symbols
	['∧', /(?:\.and|\^|\&)$/],
    ['∨', /\.(?:or|v)$/],
    ['¬', /\.not$/],
    ['→', /(?:\.imp|->|↔f)$/],
    ['←', /(?:\.if|<-|→f)$/],
    ['↔', /(?:←f|<->)$/],
    ['(', /(?:\.ll|\)f|\[)$/],
    [')', /(?:\.rr|\(f|\])$/],
    ['⊤', /\.(?:top|true)$/],
    ['⊥', /\.(?:bottom|false|absurdity)$/],
	['∀', /\.(?:A|all|forall)$/],
	['∃', /\.(?:E|exists)$/],

	// Lowercase Greek letters
    ['α', /\.alpha$/],
    ['β', /\.beta$/],
    ['ϕ', /\.phi1$/],
    ['φ', /\.phi2$/],
    ['χ', /\.chi$/],
    ['ψ', /\.psi$/],

	// Uppercase Greek letters
    ['Φ', /\.Phi$/],
    ['Ψ', /\.Psi$/],
    ['Ω', /\.Omega$/],
];

export const symbolInputPlugin = inputRules({
	rules: rules.map(pair => new InputRule(pair[1], pair[0]))
});