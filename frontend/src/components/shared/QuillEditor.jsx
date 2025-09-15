import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// QuillEditor is an uncontrolled React component following the example pattern
const QuillEditor = forwardRef(
	(
		{
			value = "",
			onChange,
			placeholder = "Enter content...",
			readOnly = false,
			style = { height: "200px" },
		},
		ref
	) => {
		const containerRef = useRef(null);
		const defaultValueRef = useRef(value);
		const onChangeRef = useRef(onChange);

		useLayoutEffect(() => {
			onChangeRef.current = onChange;
		});

		useEffect(() => {
			if (ref && ref.current) {
				ref.current.enable(!readOnly);
			}
		}, [ref, readOnly]);

		useEffect(() => {
			const container = containerRef.current;
			if (!container) return;

			const editorContainer = container.appendChild(
				container.ownerDocument.createElement("div")
			);

			const quill = new Quill(editorContainer, {
				theme: "snow",
				readOnly,
				placeholder,
				modules: {
					toolbar: [
						[{ header: [1, 2, 3, 4, 5, 6, false] }],
						["bold", "italic", "underline", "strike"],
						[{ color: [] }, { background: [] }],
						[{ list: "ordered" }, { list: "bullet" }],
						[{ indent: "-1" }, { indent: "+1" }],
						[{ align: [] }],
						["link", "image", "video"],
						["blockquote", "code-block"],
						["clean"],
					],
				},
				formats: [
					"header",
					"font",
					"size",
					"bold",
					"italic",
					"underline",
					"strike",
					"blockquote",
					"list",
					"indent",
					"link",
					"image",
					"video",
					"color",
					"background",
					"align",
					"code-block",
				],
			});

			if (ref) {
				ref.current = quill;
			}

			// Set initial value
			if (defaultValueRef.current) {
				quill.root.innerHTML = defaultValueRef.current;
			}

			// Handle text changes
			quill.on(Quill.events.TEXT_CHANGE, () => {
				if (onChangeRef.current) {
					const html = quill.root.innerHTML;
					onChangeRef.current(html);
				}
			});

			return () => {
				if (ref) {
					ref.current = null;
				}
				container.innerHTML = "";
			};
		}, [ref]);

		// Separate effect to handle value updates without re-initializing
		useEffect(() => {
			if (ref && ref.current && value !== undefined) {
				const currentContent = ref.current.root.innerHTML;
				if (currentContent !== value) {
					// Use setContents for proper Quill formatting
					ref.current.setContents(ref.current.clipboard.convert(value));
				}
			}
		}, [value]);

		return (
			<div ref={containerRef} style={{ ...style, position: "relative" }}></div>
		);
	}
);

QuillEditor.displayName = "QuillEditor";

export default QuillEditor;
