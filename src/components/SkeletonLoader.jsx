/* Pulse skeleton — matches Inkwell dark + Aged Paper light themes */

function Bone({ width = '100%', height = 12, radius = 6, style = {} }) {
  return (
    <div
      style={{
        width, height,
        borderRadius: radius,
        backgroundColor: 'var(--bg-surface-2)',
        animation: 'sk-pulse 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="card px-3 py-2.5 sm:px-4 sm:py-3">
      <Bone width="55%" height={9} style={{ marginBottom: 8 }} />
      <Bone width="70%" height={22} radius={5} />
    </div>
  );
}

function TaskRowSkeleton({ width = '80%' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px' }}>
      <Bone width={16} height={16} radius={4} style={{ flexShrink: 0 }} />
      <Bone width={width} height={10} />
      <Bone width={28} height={14} radius={3} style={{ flexShrink: 0 }} />
    </div>
  );
}

function BarChartSkeleton() {
  const heights = ['55%', '70%', '100%', '40%', '80%', '55%', '35%'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 60, padding: '0 4px' }}>
      {heights.map((h, i) => (
        <div key={i} style={{ flex: 1, height: h, borderRadius: '3px 3px 0 0',
          backgroundColor: 'var(--bg-surface-2)',
          animation: `sk-pulse 1.6s ease-in-out ${i * 0.1}s infinite`,
        }} />
      ))}
    </div>
  );
}

export function DayTrackerSkeleton() {
  return (
    <div className="min-h-screen px-3 sm:px-5 lg:px-8 py-4 sm:py-6">
      <style>{`
        @keyframes sk-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Bone width={180} height={10} style={{ marginBottom: 10 }} />
        <Bone width={260} height={28} radius={6} style={{ marginBottom: 8 }} />
        <Bone width={320} height={10} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3" style={{ marginBottom: 20 }}>
        {[0,1,2,3].map((i) => <StatCardSkeleton key={i} />)}
      </div>

      {/* Cards — mobile stacks, desktop 3-col */}
      <div className="flex flex-col lg:hidden gap-4">
        {/* Todo */}
        <div className="card" style={{ padding: '12px 0 8px' }}>
          <div style={{ padding: '0 14px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Bone width={60} height={11} />
              <Bone width={40} height={18} radius={20} />
            </div>
          </div>
          {['85%','70%','90%','65%','75%'].map((w, i) => (
            <TaskRowSkeleton key={i} width={w} />
          ))}
        </div>

        {/* Bar chart */}
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <Bone width={120} height={10} />
            <Bone width={60} height={16} radius={20} />
          </div>
          <BarChartSkeleton />
        </div>

        {/* Line chart */}
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <Bone width={140} height={10} />
            <Bone width={30} height={18} radius={4} />
          </div>
          <Bone width="100%" height={100} radius={6} />
        </div>
      </div>

      <div className="hidden lg:grid grid-cols-3 gap-4">
        {/* Left col */}
        <div className="flex flex-col gap-4">
          <div className="card" style={{ padding: '12px 0 8px' }}>
            <div style={{ padding: '0 14px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: 8 }}>
              <Bone width={80} height={11} />
            </div>
            {['85%','70%','90%','65%','75%','80%'].map((w, i) => (
              <TaskRowSkeleton key={i} width={w} />
            ))}
          </div>
          <div className="card" style={{ padding: 14 }}>
            <Bone width={100} height={11} style={{ marginBottom: 12 }} />
            <Bone width="100%" height={120} radius={6} />
          </div>
        </div>

        {/* Center col */}
        <div className="flex flex-col gap-4">
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <Bone width={120} height={10} />
              <Bone width={60} height={16} radius={20} />
            </div>
            <BarChartSkeleton />
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <Bone width={140} height={10} />
              <Bone width={30} height={18} radius={4} />
            </div>
            <Bone width="100%" height={120} radius={6} />
          </div>
        </div>

        {/* Right col */}
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <Bone width={100} height={11} />
            <Bone width={50} height={16} radius={20} />
          </div>
          <Bone width="100%" height={200} radius={6} style={{ marginBottom: 12 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="card" style={{ padding: 12 }}>
              <Bone width="60%" height={9} style={{ marginBottom: 8 }} />
              <Bone width="80%" height={22} radius={4} />
            </div>
            <div className="card" style={{ padding: 12 }}>
              <Bone width="60%" height={9} style={{ marginBottom: 8 }} />
              <Bone width="80%" height={22} radius={4} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FitnessTrackerSkeleton() {
  return (
    <div className="min-h-screen px-3 sm:px-5 lg:px-8 py-4 sm:py-6">
      <style>{`
        @keyframes sk-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <Bone width={180} height={10} style={{ marginBottom: 10 }} />
        <Bone width={220} height={28} radius={6} style={{ marginBottom: 8 }} />
        <Bone width={300} height={10} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3" style={{ marginBottom: 20 }}>
        {[0,1,2,3].map((i) => <StatCardSkeleton key={i} />)}
      </div>

      <div className="flex flex-col lg:hidden gap-4">
        {/* Exercise list */}
        <div className="card" style={{ padding: '12px 0 8px' }}>
          <div style={{ padding: '0 14px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: 8 }}>
            <Bone width={100} height={11} />
          </div>
          {['75%','85%','65%','90%'].map((w, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px' }}>
              <div style={{ flex: 1 }}>
                <Bone width={w} height={11} style={{ marginBottom: 5 }} />
                <Bone width="50%" height={9} />
              </div>
              <Bone width={35} height={14} radius={4} />
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="card" style={{ padding: 14 }}>
          <Bone width={120} height={10} style={{ marginBottom: 14 }} />
          <Bone width="100%" height={120} radius={6} style={{ marginBottom: 14 }} />
          <Bone width={140} height={10} style={{ marginBottom: 10 }} />
          <Bone width="100%" height={80} radius={6} />
        </div>

        {/* Body stats */}
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 12 }}>
            <Bone width={90} height={10} />
            <Bone width={50} height={14} radius={4} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <Bone width="100%" height={54} radius={6} />
            <Bone width="100%" height={54} radius={6} />
          </div>
        </div>
      </div>

      <div className="hidden lg:grid grid-cols-3 gap-4">
        <div className="card" style={{ padding: '12px 0 8px', minHeight: 400 }}>
          <div style={{ padding: '0 14px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: 8 }}>
            <Bone width={110} height={11} />
          </div>
          {['75%','85%','65%','90%','70%'].map((w, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px' }}>
              <div style={{ flex: 1 }}>
                <Bone width={w} height={11} style={{ marginBottom: 5 }} />
                <Bone width="50%" height={9} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className="card" style={{ padding: 14 }}>
            <Bone width={120} height={10} style={{ marginBottom: 14 }} />
            <Bone width="100%" height={130} radius={6} style={{ marginBottom: 14 }} />
            <Bone width={140} height={10} style={{ marginBottom: 10 }} />
            <Bone width="100%" height={90} radius={6} />
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 12 }}>
              <Bone width={90} height={10} />
              <Bone width={50} height={14} radius={4} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <Bone width="100%" height={54} radius={6} />
              <Bone width="100%" height={54} radius={6} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="card" style={{ padding: 14 }}>
            <Bone width={100} height={10} style={{ marginBottom: 14 }} />
            <Bone width="100%" height={160} radius={6} />
          </div>
          <div className="card" style={{ padding: 14 }}>
            <Bone width={120} height={10} style={{ marginBottom: 14 }} />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom: 12 }}>
              {[...Array(7)].map((_,i) => <Bone key={i} width="100%" height={28} radius={6} />)}
            </div>
            <Bone width="100%" height={50} radius={6} />
          </div>
        </div>
      </div>
    </div>
  );
}
