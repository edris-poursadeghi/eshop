import React, { useEffect, useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      [{ direction: 'rtl' }], // text direction
      [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'], // remove formatting button
    ],
    // If you need custom handlers (e.g., custom image uploads),
    // you would add them here:
    // handlers: { image: imageHandler }
  },
  clipboard: {
    matchVisual: false, // Recommended: helps with pasting from Word/Docs
  },
};

const formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
  'code-block',
  'color',
  'background',
  'align',
  'script',
];

const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const quillRef = React.useRef(false);

  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = true;
    }

    // Fix : ensure only one toolbar is present

    setTimeout(() => {
      document.querySelectorAll('.ql-toolbar').forEach((toolbar, index) => {
        if (index > 0) {
          toolbar.remove();
        }
      });
    }, 100);
  }, []);

  return (
    <div className="relative">
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(content) => {
          setEditorValue(content);
          onChange(content);
        }}
        modules={modules}
        //  formats={formats}
        placeholder="Write a detailed product description here ..."
        className="bg-transparent border border-gray-700 text-white rounded-md"
        style={{
          minHeight: '250px',
        }}
      />

      <style>{`
  /* 1. Editor Structure & Backgrounds */
  .ql-toolbar.ql-snow,
  .ql-container.ql-snow {
    border-color: #444 !important;
    background-color: transparent !important;
  }

  .ql-toolbar.ql-snow {
    border-top-left-radius: 0.375rem;
    border-top-right-radius: 0.375rem;
    border-bottom: none !important;
  }

  .ql-container.ql-snow {
    border-bottom-left-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }

  /* 2. Text Input Area */
  .ql-editor {
    min-height: 200px;
    color: #ffffff;
  }

  .ql-editor.ql-blank::before {
    color: #aaaaaa !important;
    font-style: normal;
  }

  /* 3. Icons (The SVG parts) */
  .ql-snow .ql-stroke {
    stroke: #ffffff !important;
  }

  .ql-snow .ql-fill {
    fill: #ffffff !important;
  }

  /* 4. Dropdowns & Pickers */
  .ql-snow .ql-picker,
  .ql-snow .ql-picker-label {
    color: #ffffff !important;
  }

  .ql-snow .ql-picker-options {
    background-color: #2a2a2a !important;
    border: 1px solid #444 !important;
  }

  .ql-snow .ql-picker-item {
    color: #ffffff !important;
  }

  .ql-snow .ql-picker-item:hover,
  .ql-snow .ql-picker-item.ql-selected {
    color: #3b82f6 !important; /* A nice blue highlight */
  }

  /* 5. Toolbar Buttons Hover/Active States */
  .ql-snow .ql-toolbar button:hover,
  .ql-snow .ql-toolbar button:focus,
  .ql-snow .ql-toolbar button.ql-active {
    background-color: #333 !important;
    border-radius: 4px;
  }
`}</style>
    </div>
  );
};

export default RichTextEditor;
