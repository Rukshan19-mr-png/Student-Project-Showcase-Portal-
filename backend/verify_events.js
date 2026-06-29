import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:123456@localhost:5432/student_showcase?schema=public' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BASE_URL = 'http://localhost:5000';

async function verify() {
  try {
    console.log('--- Step 1: Mock login for Student A and Student B ---');
    // Login Student A
    const resA = await fetch(`${BASE_URL}/auth/mock-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'studentA@test.com', name: 'Akila Student A', role: 'STUDENT' })
    });
    const dataA = await resA.json();
    const tokenA = dataA.token;
    const idA = dataA.user.id;
    console.log(`Student A Token acquired. User ID: ${idA}`);

    // Login Student B
    const resB = await fetch(`${BASE_URL}/auth/mock-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'studentB@test.com', name: 'Bob Student B', role: 'STUDENT' })
    });
    const dataB = await resB.json();
    const tokenB = dataB.token;
    const idB = dataB.user.id;
    console.log(`Student B Token acquired. User ID: ${idB}`);

    // Clean existing follow / likes / notifications for clean verification
    await prisma.notification.deleteMany({});
    await prisma.like.deleteMany({});
    await prisma.follower.deleteMany({});
    await prisma.project.deleteMany({});
    console.log('Cleaned up previous DB records for testing.');

    console.log('\n--- Step 2: Student B follows Student A ---');
    const resFollow = await fetch(`${BASE_URL}/users/${idA}/follow`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const dataFollow = await resFollow.json();
    console.log('Follow Response:', dataFollow);

    // Verify Notification for Follow
    console.log('\nChecking notifications in DB after follow...');
    let notifications = await prisma.notification.findMany({
      include: { actor: true, user: true }
    });
    console.log(`Found ${notifications.length} notification(s):`);
    notifications.forEach(n => {
      console.log(`- Type: ${n.type} | Recipient: ${n.user.name} | Actor: ${n.actor.name}`);
    });

    console.log('\n--- Step 3: Student A creates a project ---');
    const form = new FormData();
    form.append('title', 'Decoupled Showcase');
    form.append('description', 'Event-driven notification system test project.');
    form.append('repositoryUrl', 'https://github.com/studentA/event-test');

    const resCreate = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` },
      body: form
    });
    const project = await resCreate.json();
    console.log('Project Created:', project);

    // Verify Notification for Project Creation (Followers should receive it)
    console.log('\nChecking notifications in DB after project creation...');
    notifications = await prisma.notification.findMany({
      include: { actor: true, user: true }
    });
    console.log(`Found ${notifications.length} notification(s):`);
    notifications.forEach(n => {
      console.log(`- Type: ${n.type} | Recipient: ${n.user.name} | Actor: ${n.actor.name}`);
    });

    console.log('\n--- Step 4: Student B likes Student A\'s project ---');
    const resLike = await fetch(`${BASE_URL}/projects/${project.id}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const dataLike = await resLike.json();
    console.log('Like Response:', dataLike);

    // Verify Notification for Project Like
    console.log('\nChecking notifications in DB after project like...');
    notifications = await prisma.notification.findMany({
      include: { actor: true, user: true }
    });
    console.log(`Found ${notifications.length} notification(s):`);
    notifications.forEach(n => {
      console.log(`- Type: ${n.type} | Recipient: ${n.user.name} | Actor: ${n.actor.name}`);
    });

    console.log('\n--- Step 5: Student B unlikes Student A\'s project ---');
    const resUnlike = await fetch(`${BASE_URL}/projects/${project.id}/like`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const dataUnlike = await resUnlike.json();
    console.log('Unlike Response:', dataUnlike);

    console.log('\n--- Step 6: Student B unfollows Student A ---');
    const resUnfollow = await fetch(`${BASE_URL}/users/${idA}/follow`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const dataUnfollow = await resUnfollow.json();
    console.log('Unfollow Response:', dataUnfollow);

  } catch (error) {
    console.error('Verification failed with error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

verify();
