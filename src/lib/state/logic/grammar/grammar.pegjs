{{
  import { AtomicFormula, UnaryFormula, BinaryFormula, MetaFormula } from "./";
}}

Bionditional
  = _ head:LeftImplication tail:(_ "↔" _ LeftImplication)* _ {
      return tail.reduce(function(result, element) {
        return new BinaryFormula(text(), "↔", [result, element[3]]);
      }, head);
    }
    
LeftImplication
  = head:Implication tail:(_ "←" _ Implication)* {
      return tail.reduce(function(result, element) {
        return new BinaryFormula(text(), "←", [result, element[3]]);
      }, head);
    }

Implication
  = head:Disjunction tail:(_ "→" _ Implication)? {
  	  if (!tail) return head;
      return new BinaryFormula(text(), "→", [head, tail[3]]);
    }

Disjunction
  = head:Conjunction tail:(_ "∨" _ Conjunction)* {
      return tail.reduce(function(result, element) {
        return new BinaryFormula(text(), "∨", [result, element[3]]);
      }, head);
    }

Conjunction
  = head:Primary tail:(_ "∧" _ Primary)* {
      return tail.reduce(function(result, element) {
        return new BinaryFormula(text(), "∧", [result, element[3]]);
      }, head);
    }

Primary
  = "(" expr:Bionditional ")" { return expr }
  / "¬" _ expr:Primary { return new UnaryFormula(text(), "¬", [expr]) }
  / Atom

Atom "atomic statement"
  = ([A-Z] [a-zA-Z0-9]* / [⊤⊥]) { const t = text(); return new AtomicFormula(t, t) }
  / "[" name:[0-9]+ "]" { return new MetaFormula(text(), name.join('')) }

_ "whitespace"
  // \xC2\xA0 is non-breaking whitespace
  = [ \xC2\xA0\t\n\r]*