
import React from 'react';
import { AuditLog } from '../types';
import { History, ShieldAlert, User, Activity } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="text-blue-600" /> System Audit Logs
          </h1>
          <p className="text-slate-500 text-sm">Every administrative action is tracked and immutable.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-xs font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={12} />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{log.userId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                      log.action.includes('CREATED') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      log.action.includes('UPDATE') ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      log.action.includes('SWITCH') ? 'bg-violet-50 text-violet-700 border-violet-100' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 line-clamp-1">{log.details}</p>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center opacity-40 italic text-sm">
                    No system events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;
