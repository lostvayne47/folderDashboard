📊 Folder Dashboard

A dashboard view for BFolder that enables quick, at-a-glance monitoring of multiple data points within a folder.

⚠️ Note on Commit History

This project was migrated from a restricted work environment, so the original commit history isn’t available. The code here reflects the final, restructured version. 

💡 Overview

The goal of this dashboard is to provide a top-level, real-time view of key data points within a folder, allowing users to quickly assess system status without navigating deeply.

⚙️ Workflow

1. A blank canvas is loaded as a view on any folder.

2. On initialization, the folder is scanned for variables that are numeric or boolean writables (as per requirements).

3. Relevant points are filtered and selected for further processing.

4. Subscribers are attached to each selected point to listen for value updates.

5. Each point is represented as a card, which is dynamically rendered on the dashboard.

6. Card styling is determined based on:
    -> Output values
    -> Predefined conditions
These styles update in real-time as values change.

7. A subscriber is also attached to the folder to handle:

8. Addition of new points

9. Removal of existing points

10. Right-clicking on a card allows users to:
  -> Invoke overrides
  -> Clear overrides
These changes are reflected on the card in real-time.

🧠 Implementation Notes

-> The project is built using pure HTML, CSS, JavaScript, and jQuery.

-> jQuery is used for DOM manipulation and updating card values/styles dynamically.

-> The core logic revolves around:
  -> Subscribing to data points
  -> Reacting to real-time updates

🔄 Possible Improvements

-> The UI layer can be improved by replacing jQuery with React:

-> State-driven updates would simplify UI rendering

-> React hooks can efficiently manage value updates and re-renders

-> However, the core subscription and data-fetching logic would remain unchanged, as it is independent of the UI framework.

🛠 Installation & Setup

To build and run this project, please follow the steps below:

1. Configure the Niagara installation path in the `gradle.properties` file.
2. Ensure Gradle is properly set up on your system.
3. Build the project using Gradle.

> Note: This project was built using Niagara version 4.15.2.


<img width="1858" height="939" alt="image" src="https://github.com/user-attachments/assets/46887625-3133-4cb6-a86c-bd554a8ae551" />

<img width="1856" height="946" alt="image" src="https://github.com/user-attachments/assets/c382085f-794f-4155-81cd-128901248b97" />

