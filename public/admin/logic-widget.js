// public/admin/logic-widget.js

// Register a custom widget for formal logic expressions
CMS.registerEditorComponent({
  id: "formal-logic",
  label: "Formal Logic",
  fields: [
    {
      name: "logic",
      label: "Logic Expression",
      widget: "text"
    },
    {
      name: "display",
      label: "Display Mode",
      widget: "select",
      options: ["block", "inline"],
      default: "block"
    }
  ],
  pattern: /^<div class="logic-expression( inline)?">([\s\S]*?)<\/div>$/,
  fromBlock: function(match) {
    return {
      logic: match[2],
      display: match[1] ? "inline" : "block"
    };
  },
  toBlock: function(data) {
    const isInline = data.display === "inline";
    return `<div class="logic-expression${isInline ? " inline" : ""}">${data.logic}</div>`;
  },
  toPreview: function(data) {
    const isInline = data.display === "inline";
    return `<div class="logic-expression${isInline ? " inline" : ""}" style="
      font-family: 'Noto Serif', serif;
      padding: ${isInline ? '0.1em 0.4em' : '0.75em 1em'};
      background: rgba(0, 0, 0, 0.5);
      border-radius: 5px;
      ${!isInline ? 'border-left: 3px solid #3b82f6;' : ''}
      margin: ${isInline ? '0 0.2em' : '1em 0'};
      display: ${isInline ? 'inline-block' : 'block'};
    ">${data.logic}</div>`;
  }
});

// Register a component for formal proofs
CMS.registerEditorComponent({
  id: "formal-proof",
  label: "Formal Proof",
  fields: [
    {
      name: "proofLines",
      label: "Proof Steps (one per line)",
      widget: "list",
      field: {
        name: "line",
        label: "Proof Step",
        widget: "object",
        fields: [
          { name: "number", label: "Line Number", widget: "string" },
          { name: "formula", label: "Formula", widget: "string" },
          { name: "justification", label: "Justification", widget: "string", required: false }
        ]
      }
    }
  ],
  pattern: /^<div class="logic-block proof">([\s\S]*?)<\/div>$/,
  fromBlock: function(match) {
    const proofContent = match[1];
    const lines = proofContent.match(/<div class="proof-line">[\s\S]*?<\/div>/g) || [];
    
    const proofLines = lines.map(line => {
      const numberMatch = line.match(/<span class="line-number">(.*?)<\/span>/);
      const formulaMatch = line.match(/<span class="line-formula">(.*?)<\/span>/);
      const justificationMatch = line.match(/<span class="line-justification">(.*?)<\/span>/);
      
      return {
        number: numberMatch ? numberMatch[1].replace(/\.$/, '') : '',
        formula: formulaMatch ? formulaMatch[1] : '',
        justification: justificationMatch ? justificationMatch[1] : ''
      };
    });
    
    return { proofLines };
  },
  toBlock: function(data) {
    const lines = data.proofLines.map(line => {
      return `<div class="proof-line">
        <span class="line-number">${line.number}.</span>
        <span class="line-formula">${line.formula}</span>
        ${line.justification ? `<span class="line-justification">${line.justification}</span>` : ''}
      </div>`;
    }).join('\n');
    
    return `<div class="logic-block proof">${lines}</div>`;
  },
  toPreview: function(data) {
    const lines = data.proofLines.map(line => {
      return `<div style="display: flex; margin: 0.3em 0;">
        <span style="min-width: 2em; text-align: right; margin-right: 0.75em; color: #9ca3af;">${line.number}.</span>
        <span style="flex-grow: 1;">${line.formula}</span>
        ${line.justification ? `<span style="margin-left: 1em; color: #9ca3af; font-style: italic;">${line.justification}</span>` : ''}
      </div>`;
    }).join('\n');
    
    return `<div style="
      font-family: 'Noto Serif', serif;
      line-height: 1.6;
      margin: 1.5em 0;
      padding: 1em 1.25em;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 5px;
      border-left: 4px solid #3b82f6;
    ">${lines}</div>`;
  }
});