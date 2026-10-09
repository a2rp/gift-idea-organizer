import { useEffect, useMemo, useState } from "react";
import { FiArrowUpRight, FiCheck, FiGift, FiHeart, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import ConfirmDialog from "../confirmDialog";
import styles from "./styles.module.css";

const storageKey = "goodthing-gift-ideas";
const starterIdeas = [
    { id: 1, recipient: "Nora", gift: "Ceramic pour-over set", occasion: "December", category: "Home", budget: 48, bought: false },
    { id: 2, recipient: "Mateo", gift: "A day at the climbing gym", occasion: "Birthday", category: "Experience", budget: 72, bought: true },
    { id: 3, recipient: "Sam", gift: "Botanical print set", occasion: "New home", category: "Art", budget: 34, bought: false },
    { id: 4, recipient: "Mom", gift: "Japanese garden journal", occasion: "December", category: "Books", budget: 28, bought: false },
];

const readIdeas = () => {
    try {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : starterIdeas;
    } catch {
        return starterIdeas;
    }
};

const GiftIdeaOrganizer = () => {
    const [ideas, setIdeas] = useState(readIdeas);
    const [query, setQuery] = useState("");
    const [person, setPerson] = useState("All people");
    const [filter, setFilter] = useState("All ideas");
    const [draft, setDraft] = useState({ recipient: "", gift: "", occasion: "", budget: "" });
    const [pendingDelete, setPendingDelete] = useState(null);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(ideas));
    }, [ideas]);

    const recipients = useMemo(() => ["All people", ...new Set(ideas.map((idea) => idea.recipient))], [ideas]);
    const visibleIdeas = ideas.filter((idea) => {
        const matchesText = (idea.recipient + " " + idea.gift + " " + idea.category).toLowerCase().includes(query.toLowerCase());
        const matchesPerson = person === "All people" || idea.recipient === person;
        const matchesStatus = filter === "All ideas" || (filter === "Bought" ? idea.bought : !idea.bought);
        return matchesText && matchesPerson && matchesStatus;
    });
    const totalBudget = ideas.reduce((sum, idea) => sum + Number(idea.budget || 0), 0);
    const boughtCount = ideas.filter((idea) => idea.bought).length;

    const addIdea = (event) => {
        event.preventDefault();
        if (!draft.recipient.trim() || !draft.gift.trim()) return;
        setIdeas((current) => [{
            id: Date.now(),
            recipient: draft.recipient.trim(),
            gift: draft.gift.trim(),
            occasion: draft.occasion.trim() || "Any time",
            category: "New idea",
            budget: Number(draft.budget) || 0,
            bought: false,
        }, ...current]);
        setDraft({ recipient: "", gift: "", occasion: "", budget: "" });
    };

    const toggleBought = (id) => setIdeas((current) => current.map((idea) => idea.id === id ? { ...idea, bought: !idea.bought } : idea));
    const removeIdea = () => {
        setIdeas((current) => current.filter((idea) => idea.id !== pendingDelete.id));
        setPendingDelete(null);
    };

    return (
        <section className={styles.giftIdeaOrganizer} id="workspace">
            <div className={styles.intro}>
                <div>
                    <p className={styles.label}>A LITTLE THOUGHT GOES A LONG WAY</p>
                    <h1>Good gifts start<br />with a good note.</h1>
                    <p className={styles.description}>Keep the ideas you hear, long before the wrapping paper.</p>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.giftIcon}><FiGift aria-hidden="true" /></span>
                    <div><strong>{ideas.length}</strong><span>ideas saved</span></div>
                    <FiArrowUpRight aria-hidden="true" className={styles.cornerIcon} />
                </div>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.statCard}><span>People on your list</span><strong>{recipients.length - 1}</strong></div>
                <div className={styles.statCard}><span>Set aside so far</span><strong>{"$" + totalBudget}</strong></div>
                <div className={styles.statCard}><span>Already taken care of</span><strong>{boughtCount} <small>of {ideas.length}</small></strong></div>
            </div>

            <section className={styles.ideaShelf} aria-label="Gift ideas">
                <div className={styles.shelfHeading}>
                    <div><p className={styles.label}>YOUR IDEA BOX</p><h2>Saved for someone</h2></div>
                    <label className={styles.searchBox}><FiSearch aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a gift" aria-label="Search gift ideas" /></label>
                </div>
                <div className={styles.filters}>
                    <div className={styles.tabs} role="group" aria-label="Filter ideas">
                        {["All ideas", "To find", "Bought"].map((option) => <button type="button" key={option} className={filter === option ? styles.activeTab : ""} onClick={() => setFilter(option)}>{option}</button>)}
                    </div>
                    <label className={styles.personSelect}><span>For</span><select value={person} onChange={(event) => setPerson(event.target.value)}>{recipients.map((name) => <option key={name}>{name}</option>)}</select></label>
                </div>
                <div className={styles.ideaGrid}>
                    {visibleIdeas.map((idea, index) => (
                        <article className={styles.ideaCard} key={idea.id}>
                            <div className={styles.cardTop}><span className={styles.giftStamp + " " + styles["stamp" + (index % 3)]}><FiHeart aria-hidden="true" /></span><button type="button" className={styles.iconButton} aria-label={"Delete " + idea.gift} onClick={() => setPendingDelete(idea)}><FiTrash2 aria-hidden="true" /></button></div>
                            <p className={styles.recipient}>{idea.recipient}<span>{idea.occasion}</span></p>
                            <h3>{idea.gift}</h3>
                            <div className={styles.cardBottom}><span>{idea.category} <b>{"$" + idea.budget}</b></span><button type="button" className={idea.bought ? styles.doneButton : styles.buyButton} onClick={() => toggleBought(idea.id)}>{idea.bought ? <><FiCheck aria-hidden="true" /> Bought</> : "Mark bought"}</button></div>
                        </article>
                    ))}
                    {visibleIdeas.length === 0 && <div className={styles.emptyState}><FiGift aria-hidden="true" /><p>No gift ideas match. Try another search or add one below.</p></div>}
                </div>
            </section>

            <form className={styles.addForm} id="add" onSubmit={addIdea}>
                <div className={styles.addIntro}><span><FiPlus aria-hidden="true" /></span><div><h2>Add an idea</h2><p>Save it before you forget it.</p></div></div>
                <label>Gift idea<input required value={draft.gift} onChange={(event) => setDraft({ ...draft, gift: event.target.value })} placeholder="A name or small description" /></label>
                <label>For<input required value={draft.recipient} onChange={(event) => setDraft({ ...draft, recipient: event.target.value })} placeholder="Recipient name" /></label>
                <label>Occasion<input value={draft.occasion} onChange={(event) => setDraft({ ...draft, occasion: event.target.value })} placeholder="Birthday, holiday..." /></label>
                <label>Budget<input type="number" min="0" value={draft.budget} onChange={(event) => setDraft({ ...draft, budget: event.target.value })} placeholder="$" /></label>
                <button type="submit" className={styles.addButton}>Save idea <FiPlus aria-hidden="true" /></button>
            </form>

            {pendingDelete && <ConfirmDialog title="Remove this gift idea?" description={"This will remove “" + pendingDelete.gift + "” from your saved ideas."} onCancel={() => setPendingDelete(null)} onConfirm={removeIdea} />}
        </section>
    );
};

export default GiftIdeaOrganizer;
