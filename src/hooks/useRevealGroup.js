import { useEffect, useRef } from "react";

function useRevealGroup(delay = 100) {
  const groupRef = useRef(null);

  useEffect(() => {
    const element = groupRef.current;
    const timeouts = [];

    if (!element) {
      return undefined;
    }

    if (!("IntersectionObserver" in window)) {
      Array.from(element.querySelectorAll(".reveal-child")).forEach((child) => {
        child.classList.add("is-visible");
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        const children = Array.from(element.querySelectorAll(".reveal-child"));

        children.forEach((child, index) => {
          const timeout = window.setTimeout(() => {
            child.classList.add("is-visible");
          }, index * delay);

          timeouts.push(timeout);
        });

        observer.unobserve(element);
      },
      {
        rootMargin: "0px 0px -60px 0px",
        threshold: 0.15,
      },
    );

    observer.observe(element);

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      observer.disconnect();
    };
  }, [delay]);

  return groupRef;
}

export default useRevealGroup;
