import React from "react";
import Image from "next/image";

// Base64 encoded SVG for default avatar - prevents 404 errors
const defaultAvatarBase64 =
	"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY0NzQ4QiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6TTcuMDcgMTguMjhjLS4zLS4zLS4zLS43OSAwLTEuMDlDNy45MSAxNi4zOCA5Ljk1IDE2IDEyIDE2YzIuMDUgMCA0LjA5LjM4IDQuOTMgMS4xOS4zLjMuMy43OSAwIDEuMDlDMTYuMDkgMTkuNjIgMTQuMDUgMjAgMTIgMjBjLTIuMDUgMC00LjA5LS4zOC00LjkzLTEuMnptMTEuMjktNS45MUMxNi45IDEzLjcyIDE0LjUgMTQgMTIgMTRjLTIuNSAwLTQuODktLjI4LTYuMzYtMS42My0uMy0uMjctLjMxLS43MiAwLTEgLjMtLjI3Ljc0LS4yNyAxLjA0IDAgMS4xMiAxLjAyIDMuMjQgMS4yNSA1LjMyIDEuMjVzNC4yLS4yMyA1LjMyLTEuMjVjLjMtLjI3Ljc0LS4yNyAxLjA0IDAgLjMuMjguMy43My0uMDEgMXpNMTIgOGMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAtNmMxLjEgMCAyIC45IDIgMnMtLjkgMi0yIDItMi0uOS0yLTIgLjktMiAyLTJ6Ii8+PC9zdmc+";

export const ProfileImage = (props: {
	src?: string | null;
	alt?: string;
	className?: string;
	width?: number;
	height?: number;
}) => {
	const { src, alt = "Profile", className, width = 100, height = 100 } = props;
	const [imgSrc, setImgSrc] = React.useState(src || defaultAvatarBase64);

	// If src is explicitly set to the missing placeholder path, use our default SVG
	React.useEffect(() => {
		if (src === "/placeholder-avatar.png") {
			setImgSrc(defaultAvatarBase64);
		} else if (src) {
			setImgSrc(src);
		}
	}, [src]);

	return (
		<Image
			src={imgSrc}
			alt={alt}
			className={className}
			width={width}
			height={height}
			onError={() => setImgSrc(defaultAvatarBase64)}
		/>
	);
};

// Export the base64 SVG for use elsewhere in the app
export const defaultProfileImageUrl = defaultAvatarBase64;
