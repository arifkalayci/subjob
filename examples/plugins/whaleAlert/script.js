function toMessage(account, ident) {
  if (ident.isSome) {
    return ident.unwrap().info.display.asRaw.toHuman();
  } else {
    return account.toHuman();
  }
}

const eventRecordsByBlock = await api.query.system.events.range([blockHash]);

const eventRecords = eventRecordsByBlock[0][1];

eventRecords.forEach(async ({event}) => {
  if (event.section === 'balances' && event.method === 'Transfer' && event.data[2].gt(threshold)) {
    let [sender, receiver] = [...event.data];
    let [senderIdent, receiverIdent] = await api.query.identity.identityOf.multi([sender, receiver]);

    channels.send(`${event.data[2].toHuman()} transferred from ${toMessage(sender, senderIdent)} to ${toMessage(receiver, receiverIdent)}`);
  }
});
