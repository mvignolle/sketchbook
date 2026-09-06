import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Button } from './components/ui/Button';

type Page =
  | { type: 'home' }
  | { type: 'create' }
  | { type: 'collection-detail'; collectionId: string }
  | { type: 'sketch-detail'; collectionId: string; sketchId: string }
  | { type: 'shared'; token: string };

function App() {
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'home' });

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <AppLayout>
      {currentPage.type === 'home' && (
        <div style={{ padding: '24px' }}>
          <h1>Collections</h1>
          <p>3 collections</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: '24px' }}>
            <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '16px', cursor: 'pointer' }} onClick={() => navigateTo({ type: 'collection-detail', collectionId: '1' })}>
              <h3 style={{ margin: '0 0 8px 0' }}>Challenge Registration</h3>
              <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Explore different ways a participant could join or create a team...</p>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>6 ideas · 1 group</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '16px', cursor: 'pointer' }}>
              <h3 style={{ margin: '0 0 8px 0' }}>Rewards Dashboard</h3>
              <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Design a dashboard that displays earned rewards...</p>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>4 ideas · 1 group</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '16px', cursor: 'pointer' }}>
              <h3 style={{ margin: '0 0 8px 0' }}>Team Selection Flow</h3>
              <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Create variations of how users can browse and join...</p>
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>5 ideas · 1 group</div>
            </div>
          </div>
          <Button onClick={() => navigateTo({ type: 'create' })} variant="primary" style={{ marginTop: '24px' }}>
            + New Collection
          </Button>
        </div>
      )}
      {currentPage.type === 'create' && (
        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
          <h1>New Collection</h1>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '32px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Collection Title</label>
              <input type="text" placeholder="e.g., Challenge Registration" style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '2px', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Exploration Brief</label>
              <textarea placeholder="Describe the design problem..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '2px', fontSize: '14px', fontFamily: 'inherit', minHeight: '120px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Number of Ideas</label>
              <input type="number" min="1" max="20" defaultValue="6" style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '2px', fontSize: '14px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="primary">Create Collection</Button>
              <Button variant="secondary" onClick={() => navigateTo({ type: 'home' })}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
      {currentPage.type === 'collection-detail' && (
        <div style={{ padding: '24px' }}>
          <button onClick={() => navigateTo({ type: 'home' })} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '12px' }}>← Back</button>
          <h1>Challenge Registration</h1>
          <p style={{ color: '#666' }}>Explore different ways a participant could join or create a team during challenge registration.</p>
          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigateTo({ type: 'sketch-detail', collectionId: '1', sketchId: String(i) })}>
                <div style={{ background: '#fafafa', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#999' }}>Sketch {i}</div>
                <div style={{ padding: '12px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13px' }}>Idea {String(i).padStart(2, '0')}</h4>
                  <button style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '12px', padding: 0 }} onClick={(e) => { e.stopPropagation(); }}>▲ 0</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {currentPage.type === 'sketch-detail' && (
        <div style={{ padding: '24px' }}>
          <button onClick={() => navigateTo({ type: 'collection-detail', collectionId: '1' })} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '12px' }}>← Back to Collection</button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
            <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '24px' }}>
              <div style={{ background: '#fafafa', minHeight: '400px', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Sketch Detail View</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '20px' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Sketch Title</h2>
              <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <h3 style={{ fontSize: '12px', color: '#999', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Concept</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>This is the concept explanation for this sketch.</p>
              </div>
              <div style={{ marginTop: '16px' }}>
                <Button variant="primary">▲ Vote (0)</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default App;
