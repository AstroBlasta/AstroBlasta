import { component$ } from '@builder.io/qwik';
import styles from './header.module.css';
import logo from '../../../media/logo.png';

export default component$(() => {
  return (
    <header class={styles.header}>
      <div class={['container', styles.wrapper, 'flex', 'justify-center', 'items-center']}>
        <div class={styles.logo}>
          <a href="/" title="Home">
            <img src={logo} alt="Logo" class="h-32" width="600" height="128" /> {/* Adjusted width and height */}
          </a>
        </div>
        <nav class={styles.nav}>
          <ul class="flex space-x-4">
            <li>
              <a href="/" class="hover:text-blue-500">Home</a>
            </li>
            <li>
              <a href="/strategy" class="hover:text-blue-500">Strategy</a>
            </li>
          </ul>
        </nav>

      </div>
    </header>
  );
});
