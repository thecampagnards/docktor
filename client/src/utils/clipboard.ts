
export function copy(value: string) {

    const f = (e: ClipboardEvent) => {
        e.clipboardData!.setData("text/plain", value);
        e.preventDefault();
        document.removeEventListener("copy", f)
    };
  
    document.addEventListener("copy", f)
    document.execCommand("copy");
}