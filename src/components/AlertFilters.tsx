import { Alert, AlertSeverity, AlertType } from '@/types/atm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface AlertFiltersProps {
  onSearchChange: (query: string) => void;
  onSeverityChange: (severity: AlertSeverity | 'ALL') => void;
  onStatusChange: (status: 'all' | 'unacknowledged' | 'acknowledged') => void;
  onSortChange: (sort: 'newest' | 'oldest' | 'severity') => void;
  onTypeChange: (type: AlertType | 'ALL') => void;
  searchQuery: string;
  selectedSeverity: AlertSeverity | 'ALL';
  selectedStatus: 'all' | 'unacknowledged' | 'acknowledged';
  selectedSort: 'newest' | 'oldest' | 'severity';
  selectedType: AlertType | 'ALL';
}

export const AlertFilters = ({
  onSearchChange,
  onSeverityChange,
  onStatusChange,
  onSortChange,
  onTypeChange,
  searchQuery,
  selectedSeverity,
  selectedStatus,
  selectedSort,
  selectedType,
}: AlertFiltersProps) => {
  const handleReset = () => {
    onSearchChange('');
    onSeverityChange('ALL');
    onStatusChange('all');
    onSortChange('newest');
    onTypeChange('ALL');
  };

  const alertTypes: AlertType[] = [
    'MOTION',
    'VIBRATION',
    'FIRE',
    'CAMERA_TAMPER',
    'HUMAN_DETECTED',
  ];

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedSeverity !== 'ALL' ||
    selectedStatus !== 'all' ||
    selectedSort !== 'newest' ||
    selectedType !== 'ALL';

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search alerts by message or device ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Row 1 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Severity Filter */}
        <Select value={selectedSeverity} onValueChange={onSeverityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Severities</SelectItem>
            <SelectItem value="CRITICAL">Critical Only</SelectItem>
            <SelectItem value="HIGH">High & Above</SelectItem>
            <SelectItem value="MEDIUM">Medium & Above</SelectItem>
            <SelectItem value="LOW">Low Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={selectedStatus}
          onValueChange={onStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Alerts</SelectItem>
            <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={selectedSort} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="severity">Severity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter Row 2 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Alert Type Filter */}
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {alertTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
            <SelectItem value="UNKNOWN">Unknown</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full gap-2 sm:col-span-2 lg:col-span-2"
          >
            <X className="h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 rounded bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-semibold">Filters Applied:</span>
          {searchQuery && <span className="inline-block rounded bg-primary/10 px-2 py-1">Search: "{searchQuery}"</span>}
          {selectedSeverity !== 'ALL' && (
            <span className="inline-block rounded bg-primary/10 px-2 py-1">
              Severity: {selectedSeverity}
            </span>
          )}
          {selectedStatus !== 'all' && (
            <span className="inline-block rounded bg-primary/10 px-2 py-1">
              Status: {selectedStatus}
            </span>
          )}
          {selectedType !== 'ALL' && (
            <span className="inline-block rounded bg-primary/10 px-2 py-1">
              Type: {selectedType}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
