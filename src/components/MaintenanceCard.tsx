import { useState } from 'react';
import { toast } from 'sonner';
import { Construction, Power } from 'lucide-react';
import { useMaintenanceQuery, useSetMaintenanceMutation } from '@/services/adminApi';
import { getErrorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Platform maintenance switch. Turning it ON makes the API 503 every
 * tenant-facing route, so the tenant dashboard and the POS show a full-screen
 * maintenance page. This console stays reachable to turn it back off.
 */
export function MaintenanceCard() {
  const { data, isLoading } = useMaintenanceQuery();
  const [setMaintenance, { isLoading: saving }] = useSetMaintenanceMutation();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');

  const enabled = data?.enabled ?? false;

  const openEnable = () => {
    setMessage(data?.message ?? '');
    setConfirming(true);
  };

  const apply = async (next: boolean) => {
    try {
      const result = await setMaintenance({
        enabled: next,
        message: message.trim() || undefined,
      }).unwrap();
      toast.success(
        result.enabled
          ? 'Maintenance mode is ON — tenants now see the maintenance page.'
          : 'Maintenance mode is OFF — service restored.',
      );
      setConfirming(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update maintenance mode'));
    }
  };

  if (isLoading) return null;

  return (
    <>
      <Card
        className={cn(
          enabled && 'border-amber-500/60 bg-amber-500/10',
        )}
      >
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <Construction
              className={cn('h-5 w-5', enabled ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}
            />
            <div>
              <p className="text-sm font-semibold">
                Maintenance mode is {enabled ? 'ON' : 'off'}
              </p>
              <p className="text-sm text-muted-foreground">
                {enabled
                  ? `Tenants are blocked${data?.message ? ` — “${data.message}”` : ''}. Turn it off when the fix is deployed.`
                  : 'Turning this on blocks the tenant dashboard and POS with a maintenance page.'}
              </p>
            </div>
          </div>
          {enabled ? (
            <Button size="sm" disabled={saving} onClick={() => apply(false)}>
              <Power className="mr-1 h-4 w-4" />
              {saving ? 'Restoring…' : 'End maintenance'}
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={openEnable}>
              <Construction className="mr-1 h-4 w-4" /> Start maintenance
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirming} onOpenChange={(open) => !open && setConfirming(false)}>
        <DialogHeader>
          <DialogTitle>Start maintenance mode?</DialogTitle>
          <DialogDescription>
            Every pharmacy's dashboard and POS terminal will immediately show a maintenance page
            and stop working (offline POS billing keeps running locally). This console stays
            available to end it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="mnt-message">Message shown to users (optional)</Label>
          <Input
            id="mnt-message"
            placeholder="We are upgrading MediPOS. Back within 30 minutes."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={saving} onClick={() => apply(true)}>
            {saving ? 'Starting…' : 'Start maintenance'}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
