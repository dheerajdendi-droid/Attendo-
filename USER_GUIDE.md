# Attendo — User Guide

Attendo is an attendance and billing app for running your classes — mark who showed up, track what everyone owes, and see how each class is doing, all from your phone.

This guide covers everyday use. If you're setting the app up for the first time on a new server, see `README.md` instead.

## Logging in

The first time you open the app, you'll be asked to set a 4-digit PIN — just tap the numbers, then confirm it by entering it again. From then on, that PIN is how you get back in.

You'll stay logged in on that device for about a month, so you shouldn't need to re-enter it every time — only if you switch devices, clear your browser data, or it's been a while.

If Google or Facebook sign-in has been set up for your account, you'll also see those as options on the login screen.

## Add it to your home screen

Attendo works like a normal app once added to your home screen:

- **iPhone**: open Attendo in Safari → tap the Share icon → **Add to Home Screen**.
- **Android**: open Attendo in Chrome → tap the menu (⋮) → **Add to Home Screen** (or you may see an "Install app" prompt automatically).

It'll then launch full-screen with its own icon, like any other app.

## Setting up your studio

Before adding students, set these two things up from the **Students** tab:

- **Studio card** — your studio/business name and currency symbol (e.g. £, $, ₹). Tap **Edit** to change them.
- **Rates card** — your pricing tiers (e.g. "Group Session", "1:1 Private"). You can add as many tiers as you need, rename them, or change their price at any time by tapping **Edit rates**. Every student is assigned to one of these tiers, and that's the rate they're billed at per session attended.

Changing a tier's price only affects sessions billed *after* the change — past billing isn't recalculated.

## Adding classes and students

Still on the **Students** tab:

1. Tap **+ Add class**, give it a name, a day of the week, and a time.
2. Inside that class, tap **+ Add student** — enter their name, pick a rate tier, and optionally their parent/guardian's WhatsApp number (used later for sending fee reminders).
3. Students without a class yet can be added from the **Unassigned students** section at the bottom.

To edit or remove a class, use the pencil/bin icons on the class card. Removing a student doesn't delete their history — it just marks them inactive, so past attendance and billing records are preserved.

## Marking attendance

The **Today** tab is what you'll use during a session:

1. Tap the class chip at the top to pick which class you're running (it defaults to whichever class matches today).
2. Tap each student to mark them present — tap again to undo. **Mark everyone here** / **Clear** handle the whole group at once.
3. If you need to log attendance for a different date (e.g. catching up after a missed entry), change the date field.

**No signal? No problem.** If you're marking attendance somewhere with a weak connection, your taps are saved on the device and sent automatically the moment you're back online — you'll see a small banner counting how many changes are still waiting to sync.

## Tracking session costs

Still on **Today**, the **Session costs** section under the attendance grid lets you log costs tied to that specific class and date — court/hall hire, an assistant coach's fee, or anything else. Frequently-used costs show up as quick-add suggestions so you don't have to retype them each time.

## Billing and payments

The **Money** tab has two views:

- **By month** — everyone's fees for a given month, grouped by class. Each row shows sessions attended × rate = amount owed.
- **Outstanding** — every unpaid amount across all months, oldest first, so you can see at a glance who still owes what.

For each student, tap **Send** to open a pre-filled WhatsApp message with their fee breakdown (needs their parent's number saved against their profile), and tap **Paid**/**Unpaid** to toggle their payment status once you've been paid.

## Trends

The **Trends** tab is your at-a-glance dashboard:

- Top stat cards: active students, classes running, billed this month, all-time outstanding, and costs this month.
- Below that, a bar chart you can switch between **Students**, **Attendance**, **Payments**, and **Costs**, broken down by class, with a month selector for the last three.
- A short written summary highlights your busiest class and how much of this month's billing has been collected.

## A few things worth knowing

- **Backups**: your studio's data (students, classes, attendance, billing) lives in a database that's backed up independently of this app — ask whoever manages your deployment if you need a copy of your data.
- **Multiple people**: right now, Attendo has a single login for the whole studio (you, or whoever else knows the PIN) rather than separate accounts per staff member.
- **Editing rates later**: renaming or re-pricing a tier is safe at any time and won't touch past billing — see "Setting up your studio" above.
