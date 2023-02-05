import { parse, render } from '../../../util/parse';
import { useRef, useEffect } from 'preact/hooks';

export default function Editor({ content, onInit }) {
  const ast = useRef(parse(content));
  const input = useRef();
  const caret = useRef({});

  useEffect(() => {
    console.log('parsed');
    ast.current = parse(content);
    console.log(ast.current);
  }, [content]);

  useEffect(() => {
    onInit({ insertAtCaret });
  }, []);

  const insertAtCaret = function (node) { };

  function newLine() {
    const div = document.createElement('div');
    div.classList.add('paragraph');
    div.innerHTML = '<br />';
    return div;
  }

  function getLine(el) {
    if (el.nodeType === Node.ELEMENT_NODE) {
      return el;
    }
    return el.parentElement.closest('.paragraph');
  }

  function getElement(_) {
    if (_.nodeType === Node.ELEMENT_NODE) {
      return _;
    }
    return _.parentElement;
  }

  function getCaretOffsetWithin(tag) {
    let _range = document.getSelection().getRangeAt(0);
    let range = _range.cloneRange();
    range.selectNodeContents(tag);
    range.setEnd(_range.endContainer, _range.endOffset);
    return range.toString().length;
  }

  function getCaretData() {
    const _range = document.getSelection().getRangeAt(0).cloneRange();
    const el = getElement(_range.commonAncestorContainer);
    const line = getLine(el);

    return {
      line, el,
      lineIndex: Array.prototype.indexOf.call(input.current.children, line),
      column: getCaretOffsetWithin(line),
      offset: _range.endOffset
    };
  }

  function getNodes(el) {
    const nodes = [];
    for (const i of el.childNodes) {
      if (!i.length) {
        nodes.push(...getNodes(i));
      } else {
        nodes.push(i);
      }
    }
    return nodes;
  }

  function setCaret(el, pos) {
    let index = pos;
    const nodes = getNodes(el);

    for (let i of nodes) {
      if (index <= i.length) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(i, index);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        break;
      } else {
        index -= i.length;
      }
    }
  }

  function restoreCaret() {
    setCaret(caret.current.line, caret.current.column);
  }

  const updateCaret = () => (caret.current = getCaretData());

  function inputEvent() {
    updateCaret();
    ast.current[caret.current.line] = parse(caret.current.line.textContent, true);
    caret.current.line.innerHTML = render(ast.current[caret.current.line]);
    restoreCaret();
  }

  function keyDownEvent(e) {
    // e.preventDefault();
    // updateCaret();
    // if (!e.ctrlKey && !e.shiftKey) {
    // }
    /*if (!e.ctrlKey && !e.shiftKey) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          const n = value;
          n.splice(caret.current.lineIndex + 1, 0, {
            type: 'paragraph',
            children: [{ type: 'text', text: '' }],
          });
          console.log(n);

          if (caret.current.line === input.current.lastChild) {
            input.current.appendChild(newLine());
          } else {
            caret.current.line.nextSibling.insertBefore(
              newLine(),
              input.current
            );
          }

          setValue(n);

          break;
      }
    }*/
  }

  function pasteEvent(e) {
    console.log(e.clipboardData.getData('Text'));
  }

  function clickEvent() {
    // updateCaret();
  }

  return (
    <div
      ref={input}
      style={{
        background: '#f0f0f0',
        padding: '12px 8px',
        outline: 'none',
        fontSize: '16px',
        fontFamily: 'sans-serif',
        maxHeight: '200px',
        overflowY: 'auto',
      }}
      onKeyDown={keyDownEvent}
      onPaste={pasteEvent}
      onInput={inputEvent}
      onClick={clickEvent}
      role="textbox"
      aria-multiline="true"
      contentEditable="true"
      suppressContentEditableWarning={true}
      dangerouslySetInnerHTML={{ __html: render(ast.current) }}
    />
  );
}