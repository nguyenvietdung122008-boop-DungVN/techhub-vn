import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,mkdirSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
mkdirSync('.sites-runtime', {recursive:true});
const temp=mkdtempSync(path.resolve('.sites-runtime/techhub-tests-'));
for(const name of ['content','server']){let code=ts.transpileModule(readFileSync(`lib/${name}.ts`,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace("from './content'","from './content.mjs'");writeFileSync(path.join(temp,`${name}.mjs`),code)}
try{
const {handleHub,readBody}=await import(path.join(temp,'server.mjs'));
const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON;');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+f,'utf8'));
const db={prepare(sql){const state={values:[],bind(...v){this.values=v;return this},async all(){return {results:sqlite.prepare(sql).all(...this.values)}},async first(){return sqlite.prepare(sql).get(...this.values)||null},async run(){return sqlite.prepare(sql).run(...this.values)}};return state},async batch(stmts){sqlite.exec('BEGIN');try{const out=[];for(const s of stmts)out.push(await s.run());sqlite.exec('COMMIT');return out}catch(e){sqlite.exec('ROLLBACK');throw e}}};
const alice={id:'alice',name:'Alice',admin:false},bob={id:'bob',name:'Bob',admin:false},admin={id:'admin',name:'Moderator',admin:true};
const post=(who,body)=>handleHub(new Request('https://hub.test/api/hub',{method:'POST',headers:{'content-type':'application/json',origin:'https://hub.test'},body:JSON.stringify(body)}),db,who);
const get=who=>handleHub(new Request('https://hub.test/api/hub'),db,who);
const getThread = (who, thread, before) => {
    const params = new URLSearchParams({ thread });
    if (before) params.set('before', before);
    return handleHub(new Request('https://hub.test/api/hub?' + params), db, who);
};
const denied=async(fn,status)=>assert.rejects(fn,e=>e.status===status);
await denied(()=>readBody(new Request('https://hub.test',{method:'POST',body:'abcdef'}),3),413);
await denied(()=>post(null,{action:'profile',name:'x',bio:'',interests:''}),401);
await denied(()=>handleHub(new Request('https://hub.test/api/hub',{method:'POST',headers:{'content-type':'application/json',origin:'https://evil.test'},body:'{}'}),db,alice),403);
await post(alice,{action:'profile',name:'Alice',bio:'Dev',interests:'AI',admin:true});await post(bob,{action:'profile',name:'Bob',bio:'',interests:''});assert.equal((await get(alice)).me.admin,false);
await denied(()=>post(alice,{action:'sellerReview',target:'bob',status:'approved',reason:'self'}),403);
await denied(()=>post(alice,{action:'create',kind:'product',title:'Laptop',body:'test',category:'Laptop',payload:{price:100000}}),403);
await post(alice,{action:'seller'});await post(admin,{action:'sellerReview',target:'alice',status:'approved',reason:'Hồ sơ đã được kiểm tra nội bộ'});assert.equal((await get(alice)).me.seller_status,'approved');
const product=await post(alice,{action:'create',kind:'product',title:'Laptop thật để kiểm thử',body:'Không phải giao dịch',category:'Laptop',payload:{price:900000}});
const entry=await post(alice,{action:'create',kind:'post',title:'Bài thử',body:'Nội dung',category:'AI & Lập trình',payload:{}});
await post(bob,{action:'comment',target:entry.id,body:'Một câu trả lời'});await post(bob,{action:'link',target:entry.id,kind:'like',enabled:true});await post(bob,{action:'link',target:entry.id,kind:'like',enabled:true});assert.equal((await get(alice)).counts.find(c=>c.kind==='like').count,1);
await post(bob,{action:'progress',lesson:'python-0'});assert.equal((await get(bob)).progress.length,1);assert.equal((await get(alice)).progress.length,0);
await post(alice,{action:'order',items:[{id:product.id,quantity:2,price:1}],recipient:'Test',phone:'0900000000',address:'Địa chỉ giả lập'});const order=(await get(alice)).orders[0];assert.equal(order.total,1800000);assert.equal((await get(bob)).orders.length,0);
await denied(()=>post(bob,{action:'orderStep',target:order.id,status:'confirmed'}),404);await denied(()=>post(alice,{action:'orderStep',target:order.id,status:'delivered'}),409);for(const status of ['confirmed','shipping','delivered'])await post(alice,{action:'orderStep',target:order.id,status});assert.equal((await get(alice)).orders[0].events.length,4);
await post(bob,{action:'report',target:entry.id,reason:'Nội dung cần xem xét'});let report=(await get(bob)).reports[0];await denied(()=>post(alice,{action:'resolve',target:report.id,status:'resolved',hide:true,reason:'Không có quyền'}),403);await post(admin,{action:'resolve',target:report.id,status:'resolved',hide:true,reason:'Kiểm tra thủ công'});assert(!(await get(bob)).entities.some(e=>e.id===entry.id));assert((await get(admin)).entities.some(e=>e.id===entry.id&&e.status==='hidden'));
await post(bob,{action:'appeal',target:report.id,reason:'Xin xem xét bằng chứng bổ sung'});assert.equal((await get(bob)).reports[0].status,'appealed');await post(admin,{action:'resolve',target:report.id,status:'resolved',hide:false,reason:'Phản hồi báo cáo sau khiếu nại'});assert((await get(alice)).reports.some(r=>r.id===report.id));await post(alice,{action:'appeal',target:report.id,reason:'Chủ nội dung đề nghị xem xét'});assert.equal((await get(alice)).reports[0].status,'appealed');await post(admin,{action:'restore',target:entry.id,reason:'Đã kiểm tra lại'});assert((await get(bob)).entities.some(e=>e.id===entry.id));assert((await get(admin)).audit.length>=4);assert.equal((await get(bob)).audit.length,0);
await denied(()=>post(alice,{action:'link',target:'missing',kind:'follow',enabled:true}),400);
await post(alice, { action: 'comment', target: 'demo-post', body: 'Thử làm dự án nhỏ.' });
await post(bob, { action: 'comment', target: 'demo-post', body: 'Mình cũng đang thử.' });
await post(bob, { action: 'link', target: 'demo-post', kind: 'save', enabled: true });
await post(bob, { action: 'link', target: 'hardware', kind: 'join', enabled: true });
const sampleState = await get(bob);
assert.equal(sampleState.comments.filter(comment => comment.entity === 'demo-post').length, 2);
assert(!sampleState.entities.some(entity => entity.id === 'demo-post'));
assert(!sampleState.users.some(user => user.id.startsWith('sample:')));
assert(sampleState.links.some(link => link.target === 'demo-post' && link.kind === 'save'));
assert(sampleState.links.some(link => link.target === 'hardware' && link.kind === 'join'));
const review = await post(bob, {
    action: 'create', kind: 'review', title: 'Đủ dùng để học', body: 'Hai tuần sử dụng.',
    category: 'Laptop', payload: { product: 'demo-laptop', rating: 4, pros: 'Gọn', cons: 'Pin vừa đủ' },
});
assert((await get(alice)).entities.some(entity => entity.id === review.id && entity.payload.product === 'demo-laptop'));
await denied(() => post(bob, { action: 'create', kind: 'review', title: 'Không có sản phẩm', body: 'Nội dung',
    category: 'Laptop', payload: { product: 'missing', rating: 4, pros: 'Gọn', cons: 'Pin vừa đủ' } }), 400);
const firstPage = await getThread(alice, entry.id);
const original = firstPage.comments.find(comment => comment.author === 'Bob');
assert.equal(original.body, 'Một câu trả lời');
assert.equal(original.reply_to, null);
assert.equal(firstPage.total, 1);
await denied(() => post(null, { action: 'comment', target: entry.id, body: 'Ẩn danh', replyTo: original.id }), 401);
await post(alice, { action: 'comment', target: entry.id, body: 'Cảm ơn Bob, mình đã thử được.', replyTo: original.id });
const bobView = await getThread(bob, entry.id);
const answer = bobView.comments.find(comment => comment.reply_to === original.id);
assert.equal(answer.author, 'Alice');
assert.equal(answer.reply_author, 'Bob');
assert.equal(bobView.total, 2);
assert.equal((await get(bob)).counts.find(count => count.kind === 'comment' && count.target === entry.id).count, 2);
await denied(() => post(alice, { action: 'comment', target: 'demo-post', body: 'Sai bài viết', replyTo: original.id }), 400);
await denied(() => getThread(alice, 'demo-post', original.id), 400);
await denied(() => getThread(alice, 'missing'), 404);
assert.deepEqual(await getThread(alice, 'demo-question'), { before: null, comments: [], total: 0 });

// Use a tied timestamp to check that paging neither skips nor repeats older replies.
const olderComment = sqlite.prepare('INSERT INTO comments(id,entity,owner,body,created_at) VALUES(?,?,?,?,?)');
for (let i = 0; i < 63; i++) olderComment.run('older-' + String(i).padStart(2, '0'), entry.id, bob.id, 'Bình luận cũ', '2025-01-01T00:00:00.000Z');
let batch = await getThread(bob, entry.id);
let collected = [];
while (true) {
    collected = [...batch.comments, ...collected];
    if (!batch.before) break;
    batch = await getThread(bob, entry.id, batch.before);
}
assert.equal(collected.length, 65);
assert.equal(new Set(collected.map(comment => comment.id)).size, 65);
assert.equal(collected[0].id, 'older-00');
assert(collected.some(comment => comment.id === answer.id && comment.reply_to === original.id));
console.log('PASS: authentication, origin checks, server roles, seller approval, posts/comments, idempotent reactions, progress isolation, trusted order pricing, order ownership/transitions, moderation, appeals, audit visibility, sample threads, group membership, reviews, targeted replies and thread pagination.');
}finally{rmSync(temp,{recursive:true,force:true})}
