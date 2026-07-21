import styles from './JobfluencerLogo.module.css';

type JobfluencerLogoProps = {
  compact?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
};

export default function JobfluencerLogo({
  compact = false,
  theme = 'dark',
  className = '',
}: JobfluencerLogoProps) {
  return (
    <span
      className={`${styles.logo} ${styles[theme]} ${compact ? styles.compact : ''} ${className}`}
    >
      <svg
        className={styles.mark}
        viewBox="0 0 46 46"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className={styles.loop}
          d="M5 5h25v8H14v11.25C14 31.4 17.08 35 23.05 35 29.08 35 32 31.2 32 24.2V5h9v19.2C41 35.55 34.22 42 23.05 42 11.8 42 5 35.65 5 24.25V5Z"
        />
        <path className={styles.bridge} d="M21 17h22v8H21z" />
        <path className={styles.cut} d="M14 13h7v12h-7z" />
      </svg>

      {!compact && (
        <span className={styles.wordmark}>
          <span>job</span><strong>fluencer</strong><i aria-hidden="true" />
        </span>
      )}
    </span>
  );
}
