// Détection du type d'appareil (partagée par le rendu et la construction des niveaux)
export const IS_MOBILE = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints || 0) > 1;
