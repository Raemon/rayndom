#!/usr/bin/env python3
"""
Script to kill all active download_url.py processes.

Usage:
    python kill_download_url.py
"""
import subprocess
import sys

def find_download_url_processes():
    """Find all running processes matching download_url.py"""
    try:
        # Use ps to find all processes containing download_url.py
        result = subprocess.run(
            ['ps', 'aux'],
            capture_output=True,
            text=True,
            check=True
        )
        
        processes = []
        for line in result.stdout.split('\n'):
            if 'download_url.py' in line and 'grep' not in line and 'kill_download_url.py' not in line:
                parts = line.split()
                if parts:
                    pid = parts[1]
                    processes.append(pid)
        
        return processes
    except subprocess.CalledProcessError as e:
        print(f"Error finding processes: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error: {e}")
        return []

def kill_processes(pids):
    """Kill all processes with the given PIDs"""
    if not pids:
        print("No active download_url.py processes found.")
        return
    
    print(f"Found {len(pids)} active download_url.py process(es):")
    for pid in pids:
        print(f"  PID: {pid}")
    
    print("\nKilling processes...")
    killed_count = 0
    for pid in pids:
        try:
            subprocess.run(['kill', pid], check=True)
            print(f"  Killed PID {pid}")
            killed_count += 1
        except subprocess.CalledProcessError as e:
            print(f"  Failed to kill PID {pid}: {e}")
        except Exception as e:
            print(f"  Error killing PID {pid}: {e}")
    
    print(f"\nSuccessfully killed {killed_count} out of {len(pids)} process(es).")

def main():
    """Main entry point"""
    pids = find_download_url_processes()
    kill_processes(pids)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
