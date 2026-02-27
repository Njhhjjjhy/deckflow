import CoverPage from './components/templates/CoverPage';

const hardcodedContent = {
  headline: 'Japanese\nproperty investment\n**made easy.**',
  year: '2025',
};

function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F2F2F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}
    >
      <div
        style={{
          boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
        }}
      >
        <CoverPage content={hardcodedContent} language="en" />
      </div>
    </div>
  );
}

export default App;
