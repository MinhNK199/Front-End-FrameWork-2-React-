import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundAdmin = () => {
  return (
    <main >
      <div style={{ marginBottom: '20px', color: '#888', fontSize: '14px' }}>
        Home / 404 Error
      </div>
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>


        <h1 style={{ fontSize: '48px', margin: '20px 0' }}>404 Not Found</h1>
        <p>Your visited page not found. You may go Admin page.</p><br />


        <Link to={"/dashboard"}><button style={{ padding: '10px 20px', backgroundColor: 'red', color: '#fff', border: 'none', cursor: 'pointer' }}>

          Back to Admin Page
        </button>

        </Link>
      </div>
    </main>

  )
}

export default NotFoundAdmin