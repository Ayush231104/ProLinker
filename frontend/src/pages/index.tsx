import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import UserLayout from "@/layout/UserLayout";
import Image from "next/image";

export default function Home() {

  const router = useRouter();

  return (
    <UserLayout>
      <div className={styles.container}>

        <div className={styles.mainContainer}>


          <div className={styles.mainContainer_left}>
            <p>Connect with Friends Without Exaggeration</p>
            <p>A true social media platform, with stories — no bluffs!</p>

            <div onClick={() => {
              router.push("/login")
            }} className={styles.buttonJoin}>
              Join Now
            </div>
          </div>

          <div className={styles.mainContainer_right}>
            <Image src="/images/conn.png" alt="connect people" />
          </div>

        </div>
      </div>
    </UserLayout>
  )
}
