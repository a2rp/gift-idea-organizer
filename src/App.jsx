import { useEffect, useState } from "react";
import styles from "./App.module.css";
import SiteHeader from "./components/siteHeader";
import SiteFooter from "./components/siteFooter";
import BackToTop from "./components/backToTop";
import GiftIdeaOrganizer from "./components/giftIdeaOrganizer";

const App = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowBackToTop(window.scrollY > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className={styles["app-shell"]} id="top">
            <SiteHeader
                title="Goodthing"
                mark="G"
                navItems={[["Ideas", "#workspace"], ["Add a gift", "#add"]]}
                repoUrl="https://github.com/a2rp/gift-idea-organizer"
            />
            <main className={styles.pageContent}>
                <GiftIdeaOrganizer />
            </main>
            <SiteFooter repoUrl="https://github.com/a2rp/gift-idea-organizer" />
            <BackToTop visible={showBackToTop} />
        </div>
    );
};

export default App;