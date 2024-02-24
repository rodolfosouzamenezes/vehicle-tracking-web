import { DriveEta } from '@mui/icons-material'
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material'

export function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <DriveEta />
        </IconButton>
        <Typography variant="h6">Vehicle Tracking - Driver</Typography>
      </Toolbar>
    </AppBar>
  )
}
