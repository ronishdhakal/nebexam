import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0b1220 0%, #10243f 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#1CA3FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            N
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
            NEB Exam
          </div>
        </div>
        <div style={{ fontSize: 58, fontWeight: 800, color: '#fff', lineHeight: 1.15, maxWidth: 980 }}>
          NEB Exam Preparation Platform
        </div>
        <div style={{ fontSize: 28, color: '#9db4cc', marginTop: 24, maxWidth: 900 }}>
          Notes, past papers and model questions for NEB — Class 10, 11 and 12.
        </div>
      </div>
    ),
    { ...size }
  );
}
