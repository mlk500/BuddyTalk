import './Dashboard.css';

const ERROR_TYPE_LABELS = {
  PAST_TENSE: 'Past tense (went, played, ate)',
  PRESENT_TENSE: 'Present tense (goes, plays, eats)',
  PLURAL: 'Plurals (cats, balls, toys)',
  ARTICLE: 'Articles (a, the)',
  OTHER: 'Other grammar',
};

export default function PracticeBreakdown({ practiceBreakdown }) {
  const hasAnyPractice = Object.keys(practiceBreakdown).length > 0;

  if (!hasAnyPractice) {
    return (
      <div className="practice-breakdown">
        <h3>🎯 WHAT WE'RE PRACTICING</h3>
        <p className="no-practice-message">No grammar practice this week — keep chatting!</p>
      </div>
    );
  }

  return (
    <div className="practice-breakdown">
      <h3>🎯 WHAT WE'RE PRACTICING</h3>
      <ul className="practice-list">
        {Object.entries(practiceBreakdown)
          .sort(([, a], [, b]) => b - a) // Sort by count descending
          .map(([errorType, count]) => (
            <li key={errorType}>
              • {ERROR_TYPE_LABELS[errorType] || errorType}: {count} time{count !== 1 ? 's' : ''}
            </li>
          ))}
      </ul>
      <p className="reassurance">This is normal! Kids learn through practice.</p>
    </div>
  );
}
