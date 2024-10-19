import useEventListener from "./useEventListener";

function useClickOutside(ref, cb) {
    if (typeof window === 'undefined') return;
    useEventListener(
        "click",
        (e) => {
            if (ref.current == null || ref.current.contains(e.target)) return;
            cb(e);
        },
        window
    );
}

export default useClickOutside;
