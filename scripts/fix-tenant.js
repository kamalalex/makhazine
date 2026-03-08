const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, '..', 'actions');

fs.readdirSync(actionsDir).forEach(file => {
    if (file.endsWith('.ts')) {
        let content = fs.readFileSync(path.join(actionsDir, file), 'utf8');

        // Replaces instances where userId: session.user.id
        content = content.replace(/userId:\s*session\.user\.id/g, "userId: (session.user as any).adminId || session.user.id");

        // Let's also replace creation commands where the creator's name is recorded if it's the creation logic.
        // Actually I will do that via multi_replace_file_content where needed to be safe.

        fs.writeFileSync(path.join(actionsDir, file), content);
        console.log(`Updated ${file}`);
    }
});
