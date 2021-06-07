import React, {useMemo, useCallback} from "react";
//import {Button} from "reactstrap";
import {Slate, Editable, withReact, /*useSlate,*/ ReactEditor} from "slate-react";
import {createEditor, Editor, Element as SlateElement, Node, Transforms} from "slate";
import { withHistory } from 'slate-history';
//import {BsCodeSlash, BsTypeBold, BsTypeH1} from "react-icons/bs";

import './slateEditor.css';

const LIST_TYPES = ['numbered-list', 'bulleted-list']

const CustomEditor = {
    isMarkActive(editor, mark) {
        const marks = Editor.marks(editor);
        return marks ? marks[mark] === true : false;
    },

    toggleMark(editor, mark) {
        const isActive = CustomEditor.isMarkActive(editor, mark)
        if (isActive) {
            Editor.removeMark(editor, mark);
        } else {
            Editor.addMark(editor, mark, true);
        }
    },
    
    isBlockActive(editor, block) {
        const [match] = Editor.nodes(editor, {
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === block,
        });

        return !!match;
    },
    
    toggleBlock(editor, format) {
        const isActive = CustomEditor.isBlockActive(editor, format);
        const isList = LIST_TYPES.includes(format);

        Transforms.unwrapNodes(editor, {
            match: n =>
                LIST_TYPES.includes(
                    !Editor.isEditor(n) && SlateElement.isElement(n) && n.type
                ),
            split: true,
        });
        Transforms.setNodes(editor,
            {
                type: isActive ? 'paragraph' : isList ? 'list-item' : format,
            },
            // {
            //     split: split,
            // },
        );

        if (!isActive && isList) {
            const block = { type: format, children: [] }
            Transforms.wrapNodes(editor, block)
        }
    },
}

let defaultEditor;

export default function SlateEditor(props) {
    
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    defaultEditor = editor;
    const value = props.value;

    const renderElement = useCallback(props => <RenderElement {...props} />, []);
    const renderLeaf = useCallback(props => <Leaf {...props} />, []);

    return (
        <div className={`${props.readonly ? "disabled" : ""} slate-container input-group-text`}>
          <Slate editor={editor} value={value} onChange={newValue => props.setValue(newValue)}>
              
            {/*<div>*/}
            {/*  <MarkButton format={"bold"} icon={<BsTypeBold/>}/>*/}
            {/*  <MarkButton format={"code"} icon={<BsCodeSlash/>}/>*/}
            {/*  <BlockButton format={"heading-one"} icon={<BsTypeH1/>}/>*/}
            {/*</div>*/}
            
            <div className={"textarea"}>
              <Editable readOnly={props.readonly} renderElement={renderElement} renderLeaf={renderLeaf} onKeyDown={e => handleHotkeys(e, editor)}/>
            </div>
          </Slate>
        </div>
    );
}

export const serialize = value => {
    return (
        value
            .map(n => Node.string(n))
            .join('\n')
    )
}

export const deserialize = string => {
    return string.split('\n').map(line => {
        return {
            children: [{ text: line }],
        }
    })
}

export function loseFocus() {
    ReactEditor.deselect(defaultEditor);
}

// const BlockButton = ({ format, icon }) => {
//     const editor = useSlate()
//     return (
//         <Button
//             active={CustomEditor.isBlockActive(editor, format)}
//             onMouseDown={event => {
//                 event.preventDefault()
//                 CustomEditor.toggleBlock(editor, format)
//             }}
//         >
//           {icon}
//         </Button>
//     )
// }
//
// const MarkButton = ({ format, icon }) => {
//     const editor = useSlate()
//     return (
//         <Button
//             active={CustomEditor.isMarkActive(editor, format)}
//             onMouseDown={event => {
//                 event.preventDefault()
//                 CustomEditor.toggleMark(editor, format)
//             }}
//         >
//           {icon}
//         </Button>
//     )
// }

const RenderElement = ({ attributes, children, element }) => {
    switch (element.type) {
        case "block-quote":
            return <blockquote {...attributes}>{children}</blockquote>
        case "bulleted-list":
            return <ul {...attributes}>{children}</ul>
        case "heading-one":
            return <h1 {...attributes}>{children}</h1>
        case "heading-two":
            return <h2 {...attributes}>{children}</h2>
        case "list-item":
            return <li {...attributes}>{children}</li>
        case "numbered-list":
            return <ol {...attributes}>{children}</ol>
        default:
            return <p {...attributes}>{children}</p>
    }
}

const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>
    }
    if (leaf.code) {
        children = <code>{children}</code>
    }

    return <span {...attributes}>{children}</span>
}

function handleHotkeys(e, editor) {
    if (!e.ctrlKey) {
        return;
    }

    switch (e.key) {
        case 'ё':
        case '`': {
            e.preventDefault();
            CustomEditor.toggleMark(editor, "code");
            break;
        }
        case 'b':
        case 'и': {
            e.preventDefault();
            CustomEditor.toggleMark(editor, "bold");
            break;
        }
        case 'h':
        case 'р': {
            e.preventDefault();
            CustomEditor.toggleBlock(editor, "heading-one", true);
            break;
        }
    }
}