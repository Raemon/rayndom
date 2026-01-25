# Notice and Build Tools

If there's a piece of this task that feels very rote and could be converted to an automated script without relying on your judgment, build a tool for it. Prefer building in typescript unless python libraries are noticeably better for the task.

When building a tool, first enter "plan mode" to ask yourself what you're trying to achieve with the tool and why, and if you have any confusion, ask me for clarification on my goals and whether you're on the right track.

Think about whether the tool is likely to be useful for multiple projects or just an ad-hoc solution for a specific project. If the latter, put it in the app/[projectname]/tools directory. If the former, put it in the /tools directory.