/**
 * main.js — Landing page entry point
 */
import './styles.css';
import { initHeroScene } from './three-scene.js';
import { initApp } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  initHeroScene();
  initApp();
});
