import Image from "next/image";
import styles from "./page.module.css";
import Atlas from "./components/atlas";

export default function Home() {
  return (
    <main className={styles.main}>
      <Atlas/>
    </main>
  );
}
