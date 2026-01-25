import { onMounted, onUnmounted, ref } from "vue";

export function useMenuState() {
  const isOpen = ref(false);

  function openMenu() {
    isOpen.value = true;
  }

  function closeMenu() {
    isOpen.value = false;
  }

  function toggleMenu() {
    isOpen.value = !isOpen.value;
  }

  function handleKey(e) {
    if (e.key === "Escape") {
      closeMenu();
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKey);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKey);
  });

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu
  };
}
