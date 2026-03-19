import { ref } from "vue";

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

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu,
  };
}
