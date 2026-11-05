import { Button } from '#/components/ui/button';
import { acceptInvite } from '#/queries/guilds';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/invite/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();

  const { mutate: acceptInviteMutation } = useMutation({
    mutationKey: ["invite"],
    mutationFn: () => acceptInvite(id)
  });

  function handleAcceptInvite() {
    acceptInviteMutation();
  }


  return <div>
    <Button onClick={() => handleAcceptInvite()}>
      ACCEPT INVITE
    </Button>
  </div>
}
