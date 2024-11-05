import { useEffect } from "react";

function useClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            // Periksa apakah ref tidak mengandung target, dan pastikan elemen yang diklik bukan pemicu dropdown
            if (!ref.current || ref.current.contains(event.target) || event.target.dataset.toggle === "dropdown") {
                return;
            }
            handler();
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}

export default useClickOutside;
